import java.util.Scanner;

public class Terminal extends Thread {

    Scanner sc;

    public Terminal(){
        sc = new Scanner(System.in);
    }

    @Override
    public void run() {
        super.run();
        while(true){
            String line = sc.nextLine();
            if(line.equals("dump")){
                System.out.println("Session dump: ");
                BriarServer.sessionManager.dump();
            }
        }
    }
}
