import java.util.ArrayList;
import java.util.HashMap;

public class SessionManager {
    HashMap<String, Session> sessions;
    public void initialize(){
        sessions = new HashMap<String, Session>();
    }

    Session accessSession(String address){
        Session userSession;
        if (sessions.get(address) == null) {
            userSession = new Session(address);
            sessions.put(address, userSession);
        }else{
            userSession = sessions.get(address);
        }
        return userSession;
    }

    void dump(){
        for(Session s : sessions.values()){
            s.dump();
        }
    }
}
