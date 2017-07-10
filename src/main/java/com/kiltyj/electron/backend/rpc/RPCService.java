package com.kiltyj.electron.backend.rpc;

public class RPCService implements CommandHandler {

    private final String serviceName;
    private EventEmitter eventEmitter;

    public RPCService(String serviceName) {
        this.serviceName = serviceName;
    }

    @Override
    public void setEventEmitter(EventEmitter eventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    // Emits an event to clients of this service
    protected void emitEvent(String type, Object payload) {
        eventEmitter.emitEvent(type, getServiceName(), payload);
    }

    // Emits an event to all clients, regardless of service
    protected void emitWildcardEvent(String type, Object payload) {
        eventEmitter.emitEvent(type, RPCServer.WILDCARD_SERVICE, payload);
    }

    @Override
    public String getServiceName() {
        return serviceName;
    }
}
