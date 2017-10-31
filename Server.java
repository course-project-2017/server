package server1;

import java.net.ServerSocket;
import java.net.Socket;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import java.util.Base64;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;


public class server {

    public static void main(String[] args) throws Throwable {
        ServerSocket ss = new ServerSocket(8083);
        Socket s = ss.accept();
        System.err.println("Client accepted");
        new Thread(new SocketProcessor(s)).start();
        ss.close();
    }

    private static class SocketProcessor implements Runnable {

        private Socket s;
        private InputStream is;
        private OutputStream os;

        private SocketProcessor(Socket s) throws Throwable {
            this.s = s;
            this.is = s.getInputStream();
            this.os = s.getOutputStream();
        }

        public void run() {
            try {
                String input = readInputHeaders();
                System.err.println(is.toString());
                ///////////////////////
                String  output = null, from = null, where = null, when = null;
                String[]lines=input.split("\n");
                for (String line : lines){
                      if (line.indexOf("&") == 0) {
                              int pos = line.indexOf("&", 1);
                              from = line.substring(1,pos);
                              line = line.substring(pos+1,line.length());
                              pos = line.indexOf("&");
                              where = line.substring(0,pos);
                              line = line.substring(pos+1,line.length());
                              when = line.substring(0,line.length());
                      }
                }
                try {
      	          Class.forName("org.postgresql.Driver");
      	          String url = "jdbc:postgresql://localhost:5432/MyBD";
      	          String login = "postgres";
      	          String password = "*********"; 
      	          Connection con = DriverManager.getConnection(url, login, password);
      	          try {
      	        	  Statement stmt = con.createStatement();
      	              ResultSet rs = stmt.executeQuery("SELECT Flight.date_flight, Flight.Time_Flight, C1.Country, Cit1.City, C2.Country, Cit2.City FROM Flight, Countries AS C1, Cities AS Cit1, Countries AS C2, Cities Cit2   WHERE (Cit1.Country=C1.ID and Flight.City_To=Cit1.ID) AND (Cit2.Country=C2.ID and Flight.City_From=Cit2.ID)"
 	            		  + "AND C1.Country='" + from + "' AND C2.Country='" + where + "' AND Flight.date_flight ='" + when + "'");
 	                  while (rs.next()) {
 	            	  output = rs.getString(1) + "&" + rs.getString(2) + "&" + rs.getString(3) + "&" + rs.getString(4) + "&" + rs.getString(5) + "&" + rs.getString(6);
 	                  System.out.println(output);
      	              }
      	              rs.close();
      	              stmt.close();
      	          } finally {
      	              con.close();
      	          }
      	      } catch (Exception e) {
      	    	  output = "ERROR! No Data Base!";
      	      }
                ///////////////////////
                writeResponse(output);
            } catch (Throwable t) {
                //do nothing
            } finally {
                try {
                    s.close();
                } catch (Throwable t) {
                    //do nothing
                }
            }
            System.err.println("Client processing finished");
        }

        private void writeResponse(String s) throws Throwable {
            String response = "HTTP/1.1 200 OK\r\n" +
                    "Server: YarServer/2009-09-09\r\n" +
                    "Content-Type: text/html\r\n" +
                    "Content-Length: " + s.length() + "\r\n" +
                    "Connection: close\r\n\r\n";
            String result = response + s;
            os.write(result.getBytes());
            os.flush();
        }

        private String readInputHeaders() throws Throwable {
            byte[] buf=new byte[1024];
            int bytes_read = 0;
            try {
                // This call to read() will wait forever, until the
                // program on the other side either sends some data,
                // or closes the socket.
                bytes_read = is.read(buf, 0, buf.length);

                // If the socket is closed, sockInput.read() will return -1.
                if(bytes_read < 0) {
                    System.err.println("Server: Tried to read from socket, read() returned < 0,  Closing socket.");
                    return null;
                }
                System.err.println("Server: Received "+bytes_read
                                   +" bytes, sending them back to client, data="
                                   +(new String(buf, 0, bytes_read)));
                return new String(buf, 0, bytes_read);
               
            }
            catch (Exception e){
                System.err.println("Exception reading from/writing to socket, e="+e);
                e.printStackTrace(System.err);
                return null;
            }
        }
    }
}
