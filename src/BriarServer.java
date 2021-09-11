import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import game.Game;
import websockets.WebsocketRegistry;

public class BriarServer {
    static SessionManager sessionManager;
    static Terminal terminal;
    static WebsocketRegistry websocketRegistry;
    static Game game;
    public static int HTTPS_PORT = 80;
    public static void main(String[] args) throws Exception {
        sessionManager = new SessionManager();
        sessionManager.initialize();
        HttpServer server = HttpServer.create(new InetSocketAddress(HTTPS_PORT), 0);
        websocketRegistry = new WebsocketRegistry();
        game = new Game();
        game.start();
        //server.createContext();
        try {
            Files.walk(Paths.get("src/site"))
                    .filter(Files::isRegularFile)
                    .forEach(s -> registerAsset(s.toString(), server));
        }catch (Exception e){
            System.out.println("Init failed: " + e);
        }

        server.createContext("/", new AssetHandler("src/site/index.html"));
        server.createContext("/js/ip.js", new IPRequestHandler());

        server.setExecutor(null); // creates a default executor
        server.start();
        terminal = new Terminal();
        terminal.start();
    }

    static void registerAsset(String path, HttpServer server){
        path = path.replaceAll("\\\\", "/");

        System.out.println("registered " + path);
        //System.out.println(path.substring(path.indexOf("/", path.indexOf("/") + 1)));

        server.createContext(/*path*/path.substring(path.indexOf("/", path.indexOf("/") + 1)), new AssetHandler(path));
    }

    static class AssetHandler implements HttpHandler {
        String path;
        public AssetHandler(String path){
            this.path = path;
        }

        @Override
        public void handle(HttpExchange t) {
            try {
                Session userSession = sessionManager.accessSession(t.getRemoteAddress().getAddress().toString());

                System.out.println("sent " + path);
                FileInputStream fis = new FileInputStream(path);
                byte[] data = fis.readAllBytes();
                //String response = new String(fis.readAllBytes(), StandardCharsets.UTF_8);
                //System.out.println(response);
                t.sendResponseHeaders(200, data.length);
                OutputStream os = t.getResponseBody();
                //System.out.println(new String(data, StandardCharsets.UTF_8));
                os.write(data);
                os.close();
                fis.close();
            }catch (Exception e){
                System.out.println("server Failed: " + e);
            }
        }
    }

    static class IPRequestHandler implements HttpHandler {

        @Override
        public void handle(HttpExchange t) throws IOException {
            String file = "var IP = \"ws://" + InetAddress.getLocalHost().getHostAddress() + ":" + WebsocketRegistry.PORT + "\";";
            byte[] data = file.getBytes(StandardCharsets.UTF_8);
            t.sendResponseHeaders(200, data.length);
            OutputStream os = t.getResponseBody();
            os.write(data);
            os.close();
        }
    }

    /*static class PostHandler implements HttpHandler{

        @Override
        public void handle(HttpExchange t) throws IOException {
            String s = t.getAttribute("userID").toString();
            System.out.println(s);

            FileInputStream fis = new FileInputStream("/src/site/index.html");
            byte[] data = fis.readAllBytes();
            //String response = new String(fis.readAllBytes(), StandardCharsets.UTF_8);
            //System.out.println(response);
            t.sendResponseHeaders(200, data.length);
            OutputStream os = t.getResponseBody();
            os.write(data);
            os.close();
            fis.close();
        }
    }*/

}

