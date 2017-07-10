package com.kiltyj.electron.backend.rpc;

public interface CommandHandler {
    // This interface should be used to indicate that the class implements public methods
    // which can be called via reflection and RPC because they all conform to the following rules:
    // - All public methods are uniquely named (i.e. methods with different parameters/return
    //   types but with the same name are not allowed)
    // - All public methods have at most one parameter that can be serialized/parsed via Gson
    // - Return values are either void, or can be serialized/parsed via Gson

    // Optional method to set the event emitter, for services which emit events
    default void setEventEmitter(EventEmitter eventEmitter) {}

    // Optional method that handler can implement to clean up any resources before shutdown
    default void cleanUpBeforeShutdown() {}

    // Optional method that handler can implement to indicate what service prefix to use, e.g.
    // for commands mapped via /commands/{service}/{method}
    // Null is used to indicate the default service mapped to /commands/{method}
    default String getServiceName() { return null; }

}
