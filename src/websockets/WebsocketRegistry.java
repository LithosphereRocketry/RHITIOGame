package websockets;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class WebsocketRegistry extends Thread {
    public static int PORT = 8001;
    public static ServerSocket socket;
    public static ArrayList<Websocket> clients;
    public WebsocketRegistry(){
        try {
            clients = new ArrayList<>();
            socket = new ServerSocket(PORT);
        }catch (Exception e){
            System.out.println(e);
        }
        start();
    }

    @Override
    public void run() {
        super.run();
        while(true){
            try{
                Socket s = socket.accept();
                Websocket websocket = new Websocket(s);
            }catch (Exception e){
                System.out.println(e);
            }
        }
    }

    public static void sendAll(String s){
        int lastSize = clients.size();
        for(int i = 0; i < clients.size(); i++){
            clients.get(i).sendText(s);
            if(lastSize != clients.size()){
                i--;
            }
        }
    }
}
