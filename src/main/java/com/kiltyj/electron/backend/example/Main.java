package com.kiltyj.electron.backend.example;

import com.kiltyj.electron.backend.rpc.RPCServer;

public class Main {
    public static void main(String[] args) {
        try {
            RPCServer server = new RPCServer();
            server.addCommandHandler(new TestService("test"));
            System.out.println("BACKEND_PORT: " + server.getListeningPort());
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }
}
