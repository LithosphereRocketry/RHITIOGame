import java.sql.Time;

public class Session {
    String sessionID;
    String userID;
    Boolean loggedIn;
    long loginTime;

    Session(String sessionID) {
        this.sessionID = sessionID;
        userID = null;
        loggedIn = false;
        loginTime = System.currentTimeMillis();
    }

    void dump(){
        System.out.println(sessionID + "\t" + userID + "\t" + loggedIn + "\t" + loginTime);
    }

    void getUserFileStream(String path){

    }
}
