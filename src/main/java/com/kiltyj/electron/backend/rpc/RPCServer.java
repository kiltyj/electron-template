package com.kiltyj.electron.backend.rpc;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import fi.iki.elonen.NanoHTTPD.Response;
import fi.iki.elonen.NanoHTTPD.Response.Status;
import fi.iki.elonen.NanoWSD;
import fi.iki.elonen.NanoWSD.WebSocket;
import fi.iki.elonen.NanoWSD.WebSocketFrame.CloseCode;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import static fi.iki.elonen.NanoHTTPD.newFixedLengthResponse;

public class RPCServer implements EventEmitter {

    public static final int ANY_PORT = 0;
    public static final String WILDCARD_SERVICE = "*";

    private final NanoWSD nanoWSD;
    private final Map<String, List<WebSocket>> socketsByService = new HashMap<>();
    private final List<CommandHandler> commandHandlers = new CopyOnWriteArrayList<>();
    private final Map<String, CommandHandler> commandHandlerMap = new HashMap<>();
    private final Map<String, Method> commandMethods = new HashMap<>();

    public RPCServer() throws IOException {
        this(ANY_PORT);
    }

    public void addCommandHandler(CommandHandler commandHandler) {
        commandHandler.setEventEmitter(this);
        commandHandlers.add(commandHandler);
        Class<?> commandHandlerInterface = CommandHandler.class;
        for (Method method : commandHandler.getClass().getDeclaredMethods()) {
            if (Modifier.isPublic(method.getModifiers())) {
                Class<?>[] paramTypes = method.getParameterTypes();
                if (paramTypes.length > 1) {
                    throw new RuntimeException(
                            "CommandHandler public methods must have at most one parameter: " + method.getName() + " has " +
                                    paramTypes.length);
                }

                // Ignore methods in the CommandHandler interface itself
                try {
                    if (commandHandlerInterface.getMethod(method.getName(), paramTypes) != null)  {
                        continue;
                    }
                } catch (NoSuchMethodException ignored) {}

                String serviceName = commandHandler.getServiceName();
                String methodName = method.getName().toLowerCase();
                String key = serviceName == null ? methodName : (serviceName.toLowerCase() + "/" + methodName);
                if (commandMethods.containsKey(key)) {
                    throw new RuntimeException("CommandHandler public methods must be uniquely named. Mulitple definitions for " + key);
                }
                commandHandlerMap.put(key, commandHandler);
                commandMethods.put(key, method);
            }
        }
    }

    public RPCServer(int listeningPort) throws IOException {
        Runtime.getRuntime().addShutdownHook(new Thread(this::cleanUpBeforeShutdown));
        nanoWSD = new NanoWSD(listeningPort) {
            @Override
            protected WebSocket openWebSocket(IHTTPSession handshake) {
                return new WebSocket(handshake) {
                    @Override
                    public Response getHandshakeResponse() {
                        String uri = handshake.getUri();
                        String[] componentsArray = uri.split("/");
                        List<String> components = new ArrayList<>();
                        for (String component : componentsArray) {
                            if (!component.isEmpty()) {
                                components.add(component.toLowerCase());
                            }
                        }
                        if (components.size() > 0 && "events".equals(components.get(0))) {
                            String serviceKey;
                            if (components.size() == 1) {
                                serviceKey = "";
                            } else {
                                serviceKey = components.get(1);
                            }
                            synchronized (socketsByService) {
                                List<WebSocket> serviceSockets = socketsByService.getOrDefault(serviceKey, new ArrayList<>());
                                serviceSockets.add(this);
                                socketsByService.put(serviceKey, serviceSockets);
                            }
                            return super.getHandshakeResponse();
                        }
                        return createErrorResponse(Status.NOT_FOUND, "Unsupported websocket URI");
                    }

                    @Override
                    protected void onClose(CloseCode code, String reason, boolean initiatedByRemote) {
                        synchronized (socketsByService) {
                            for (Map.Entry<String, List<WebSocket>> entry : socketsByService.entrySet()) {
                                entry.getValue().remove(this);
                            }
                        }
                    }

                    @Override
                    protected void onException(IOException e) {
                        e.printStackTrace();
                    }

                    @Override
                    protected void onOpen() {}
                    @Override
                    protected void onPong(WebSocketFrame webSocketFrame) {}
                    @Override
                    protected void onMessage(WebSocketFrame frame) {}
                };
            }

            @Override
            public Response serveHttp(IHTTPSession session) {
                String uri = session.getUri();
                String[] componentsArray = uri.split("/");
                List<String> components = new ArrayList<>();
                for (String component : componentsArray) {
                    if (!component.isEmpty()) {
                        components.add(component.toLowerCase());
                    }
                }

                if (components.size() > 1 && "commands".equals(components.get(0))) {
                    HashMap<String, String> map = new HashMap<>();
                    String payload;
                    try {
                        session.parseBody(map);
                        payload = map.get("postData");
                    } catch (IOException | ResponseException ex) {
                        ex.printStackTrace();
                        return createErrorResponse(Status.INTERNAL_ERROR, "Unable to read request payload");
                    }
                    if (components.size() == 2) {
                        return processCommand(components.get(1), payload);
                    } else {
                        return processCommand(components.get(1), components.get(2), payload);
                    }
                }
                return createErrorResponse(Status.NOT_FOUND, "Unsupported non-command request");
            }
        };
        nanoWSD.start(0, false);
    }

    private Response createSuccessResponse(Response.Status status, Object returnValue) {
        String body;
        if (returnValue == null) {
            body = "{\"response\":null}";
        } else {
            body = new Gson().toJson(ImmutableMap.of("response", returnValue));
        }
        return newFixedLengthResponse(Status.OK, "application/json", body);
    }

    private Response createErrorResponse(Response.Status status, String errorMessage) {
        String body;
        if (errorMessage == null) {
            body = "{\"error\":null}";
        } else {
            body = new Gson().toJson(ImmutableMap.of("error", errorMessage));
        }
        return newFixedLengthResponse(status, "application/json", body);
    }

    private Response processCommandHelper(String methodKey, String payloadString) {
        CommandHandler commandHandler = commandHandlerMap.get(methodKey);
        java.lang.reflect.Method method = commandMethods.get(methodKey);

        if (method == null) {
            String argsString = payloadString == null ? "" : payloadString;
            return createErrorResponse(Status.NOT_FOUND, "No such command: " + methodKey + "(" + argsString + ")");
        }

        Gson gson = new Gson();
        Class[] paramTypes = method.getParameterTypes();
        Object returnValue;

        if (paramTypes.length > 0) {
            // Method has a parameter
            Class paramType = paramTypes[0];
            Object parameter;
            if (payloadString == null) {
                parameter = null;
            } else {
                try {
                    parameter = gson.fromJson(payloadString, (Class<Object>) paramType);
                } catch (Exception ex) {
                    ex.printStackTrace();
                    return createErrorResponse(Status.BAD_REQUEST, "Invalid parameter object for command");
                }
            }

            try {
                returnValue = method.invoke(commandHandler, parameter);
            } catch (IllegalAccessException e) {
                e.printStackTrace();
                return createErrorResponse(Status.FORBIDDEN, "Illegal method access for command");
            } catch (InvocationTargetException e) {
                e.getCause().printStackTrace();
                return createErrorResponse(Status.INTERNAL_ERROR, e.getCause().getMessage());
            } catch (IllegalArgumentException e) {
                e.printStackTrace();
                String message = e.getMessage();
                if (message == null) {
                    message = "Invalid command payload";
                }
                return createErrorResponse(Status.BAD_REQUEST, message);
            } catch (Exception e) {
                e.printStackTrace();
                String message = e.getMessage();
                if (message == null) {
                    message = "Unknown exception";
                }
                return createErrorResponse(Status.INTERNAL_ERROR, message);
            }
        } else if (payloadString != null) {
            // Send BAD_REQUEST if payload is not null, but we have no parameter type
            return createErrorResponse(Status.BAD_REQUEST, "Unexpected payload for command: " + payloadString);
        } else {
            // Method has no parameters
            try {
                returnValue = method.invoke(commandHandler);
            } catch (IllegalAccessException e) {
                e.printStackTrace();
                return createErrorResponse(Status.FORBIDDEN, "Illegal method access for command");
            } catch (InvocationTargetException e) {
                e.getCause().printStackTrace();
                return createErrorResponse(Status.INTERNAL_ERROR, e.getCause().getMessage());
            } catch (Exception e) {
                e.printStackTrace();
                String message = e.getMessage();
                if (message == null) {
                    message = "Unknown exception";
                }
                return createErrorResponse(Status.INTERNAL_ERROR, message);
            }
        }

        return createSuccessResponse(Status.OK, returnValue);
    }

    public Response processCommand(String name, String payloadString) {
        return processCommandHelper(name, payloadString);
    }

    public Response processCommand(String service, String name, String payloadString) {
        return processCommandHelper(service + "/" + name, payloadString);
    }

    private void cleanUpBeforeShutdown() {
        for (CommandHandler commandHandler : commandHandlers) {
            commandHandler.cleanUpBeforeShutdown();
        }
    }

    public int getListeningPort() {
        return nanoWSD.getListeningPort();
    }

    private void emitEventToSockets(List<WebSocket> sockets, String eventJSON) {
        if (sockets != null) {
            for (WebSocket socket : sockets) {
                try {
                    socket.send(eventJSON);
                } catch (IOException ignored) {
                    // ignored
                }
            }
        }
    }

    private void emitEventJSON(String service, String eventJSON) {
        synchronized (socketsByService) {
            if (service == null) {
                service = "";
            }
            if (WILDCARD_SERVICE.equals(service)) {
                for (Map.Entry<String, List<WebSocket>> entry : socketsByService.entrySet()) {
                    emitEventToSockets(entry.getValue(), eventJSON);
                }
            } else {
                emitEventToSockets(socketsByService.get(service), eventJSON);
                if (!"".equals(service)) {
                    emitEventToSockets(socketsByService.get(""), eventJSON);
                }
            }
        }
    }

    public void emitEvent(String type, String service, Object event) {
        if (Map.class.isAssignableFrom(event.getClass())) {
            Map<String, Object> eventMap = new HashMap<>();
            eventMap.put("type", type);
            if (service != null) {
                eventMap.put("service", service);
            }
            eventMap.put("payload", event);
            emitEventJSON(service, new Gson().toJson(eventMap));
        } else {
            Gson gson = new Gson();
            JsonElement payloadTree = gson.toJsonTree(event);
            JsonObject eventJSON = new JsonObject();
            if (type == null) {
                eventJSON.addProperty("type", event.getClass().getName());
            } else {
                eventJSON.addProperty("type", type);
            }
            if (service != null) {
                eventJSON.addProperty("service", service);
            }
            eventJSON.add("payload", payloadTree);
            emitEventJSON(service, eventJSON.toString());
        }
    }
}
