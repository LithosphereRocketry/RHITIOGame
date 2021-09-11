package game;

import websockets.WebsocketRegistry;

public class Game extends Thread {
    public static int x;
    public static int y;
    public static final int TICK_RATE = 20;
    @Override
    public void run() {

        super.run();
        System.out.println("");
        try{

            while(true) {
                WebsocketRegistry.sendAll(x + ":" + y);
                System.out.println(x + "\t" + y);
                Thread.sleep(1000 / TICK_RATE);
            }
        }catch (Exception e){
            System.out.println("game thread died: " + e);
        }
    }
}
