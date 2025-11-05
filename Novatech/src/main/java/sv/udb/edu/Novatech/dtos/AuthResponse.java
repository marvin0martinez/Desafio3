package sv.udb.edu.Novatech.dtos;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;
    private java.util.List<String> roles;

    public AuthResponse() {}
    public AuthResponse(String token, String email, String name, java.util.List<String> roles) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.roles = roles;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public java.util.List<String> getRoles() { return roles; }
    public void setRoles(java.util.List<String> roles) { this.roles = roles; }
}