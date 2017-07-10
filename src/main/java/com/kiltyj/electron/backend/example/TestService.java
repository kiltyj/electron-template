package com.kiltyj.electron.backend.example;

import com.google.common.collect.ImmutableMap;
import com.kiltyj.electron.backend.example.payloads.TestPayload;
import com.kiltyj.electron.backend.rpc.RPCService;

public class TestService extends RPCService {

    TestService(String serviceName) {
        super(serviceName);
    }

    public void triggerEvent() {
        emitEvent("testEvent",
                new TestPayload(1, new int[] {1, 2, 3}, "one", ImmutableMap.of("a", new int[] {1})));
    }

    public void triggerWildcardEvent() {
        emitWildcardEvent("wildcardEvent",
                new TestPayload(2, new int[] {2, 4, 6}, "two", ImmutableMap.of("b", new int[] {2, 1})));
    }

    public TestPayload testCommand(TestPayload payload) {
        return payload;
    }
}
