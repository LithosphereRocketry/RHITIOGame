package websockets;

import game.Game;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Websocket extends Thread{
    private Socket s;
    private boolean alive = true;
    InputStream in;
    OutputStream out;
    public Websocket(Socket socket){
        this.s = socket;
        start();
    }

    @Override
    public void run() {
        super.run();
        try {
            in = s.getInputStream();
            out = s.getOutputStream();
            handShake();
            registerClient();
            while (alive) {
                handlePacket();
            }
        }catch (Exception e){
            System.out.println("dropped client");
        }
    }

    private void handlePacket(){
        try {
            int protocol = in.read();
            if(protocol != -1) {
                int len = in.read() - 128;
                byte[] key = new byte[]{(byte) in.read(), (byte) in.read(), (byte) in.read(), (byte) in.read()};
                //System.out.println(protocol + "\t" + len);
                for (byte b : key) {
                    //System.out.print(b + "\t");
                }
                //System.out.println();
                byte[] dec = new byte[len];
                for (int i = 0; i < len; i++) {
                    dec[i] = (byte) (in.read() ^ key[i & 0x3]);
                }
                //System.out.print("rec: ");
                for (byte b : dec) {
                    //System.out.print((char) b);
                }
                //System.out.println();
                //sendText("rec: " + new String(dec, StandardCharsets.UTF_8));

                String req = new String(dec, StandardCharsets.UTF_8);
                if(req.charAt(0) == 'w'){
                    Game.y-=3;
                }
                if(req.charAt(0) == 's'){
                    Game.y+=3;
                }
                if(req.charAt(0) == 'a'){
                    Game.x-=3;
                }
                if(req.charAt(0) == 'd'){
                    Game.x+=3;
                }
            }
            //System.out.println();
        }catch (Exception e){
            System.out.println("packet parse failure: " + e);
            destroy();
        }
    }

    private void handShake(){
        try{
            Scanner sc = new Scanner(in, "UTF-8");
            String data = sc.useDelimiter("\\r\\n\\r\\n").next();
            Matcher get = Pattern.compile("^GET").matcher(data);
            if (get.find()) {
                Matcher match = Pattern.compile("Sec-WebSocket-Key: (.*)").matcher(data);
                match.find();
                byte[] response = ("HTTP/1.1 101 Switching Protocols\r\n"
                        + "Connection: Upgrade\r\n"
                        + "Upgrade: websocket\r\n"
                        + "Sec-WebSocket-Accept: "
                        + Base64.getEncoder().encodeToString(MessageDigest.getInstance("SHA-1").digest((match.group(1) + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").getBytes("UTF-8")))
                        + "\r\n\r\n").getBytes("UTF-8");
                out.write(response, 0, response.length);
                out.flush();
            }else{
                destroy();
            }
        }catch (Exception e){
            System.out.println("Handshake failed: " + e);
            destroy();
        }

    }

    private void registerClient(){
        WebsocketRegistry.clients.add(this);
    }

    public void destroy() {
        try{
            s.close();
        }catch (Exception ignored){}
        WebsocketRegistry.clients.remove(this);
        alive = false;
    }

    // using 0x1 Protocol
    public void sendText(String s){
        // TODO: Add alternate protocol
        if(s.length() >= 128){
            return;
        }
        byte protocol = (byte) (128 + 0x1);
        byte len = (byte) (s.getBytes(StandardCharsets.UTF_8).length);
        System.out.println(s.getBytes(StandardCharsets.UTF_8).length + "\t" + len);
        //byte[] key = {0x1, 0x2, 0x3, 0x4};
        //byte[] key = lastKey;
        byte[] msg = new byte[2 + (int)len];
        msg[0] = protocol;
        msg[1] = len;
        //System.out.println((int)len + "\t" + msg.length);
        //msg[2] = key[0];
        //msg[3] = key[1];
        //msg[4] = key[2];
        //msg[5] = key[3];
        /*for(int i = 0; i < s.length(); i++){
            msg[6 + i] = (byte)((byte)s.charAt(i) ^ key[i & 3]);
        }*/
        for(int i = 0; i < s.length(); i++){
            msg[2 + i] = (byte)s.charAt(i);
        }
        for(byte b : msg){
            System.out.print(b + "\t");
        }
        System.out.println();
        try{
            out.write(msg);
            out.flush();
        }catch (Exception e){
            System.out.println("Send failed: " + e);
            destroy();
        }
    }
}
