package net.mcbbs.client.socketserver;

public enum CommandSource
{
    HTML5("H5"), JAVA("java"), NODE("node");

    CommandSource(String h5) {
        sourceName=h5;
    }
    private final String sourceName;

    public String getSourceName() {
        return sourceName;
    }
}