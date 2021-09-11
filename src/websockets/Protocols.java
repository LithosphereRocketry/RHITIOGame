package websockets;

import java.util.ArrayList;

public class Protocols {
    ArrayList<Protocol> protocols;
    interface Protocol{
        byte[] encode(byte[] data);
        byte[] decode(byte[] data);
    }
    static class TextProtocol implements Protocol{

        @Override
        public byte[] encode(byte[] data) {
            return new byte[0];
        }

        @Override
        public byte[] decode(byte[] data) {
            return new byte[0];
        }
    }
}
