package test2;

import java.io.*;
import java.net.*;

public class Server {
  public static void main(String[] args) throws IOException {
	  
    try (ServerSocket servers = new ServerSocket(4443)){  //some port for comp
   
    	System.out.print("Waiting for a client...");
         Socket fromclient= servers.accept();
         System.out.println("Client connected");
   /////////////////     
         DataOutputStream out = new DataOutputStream(fromclient.getOutputStream());
         DataInputStream in = new DataInputStream(fromclient.getInputStream());
         String input = in.readUTF();
         //process data base -> output
         String output = null;
         out.writeUTF(output);
         out.flush();
         out.close();
         in.close();
         fromclient.close();
    ////////////////
         
         //     servers.close();
    } catch (IOException e) {
      System.out.println("error");
      System.exit(-1);
    }

   
    
  }
}
