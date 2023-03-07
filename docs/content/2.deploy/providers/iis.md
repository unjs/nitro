# IIS

Deploy Nitro apps to IIS.

**Preset:** `there is no preset`

First of all Node.js has to be installed on the Windows Server.

To deploy a Nitro application to IIS, the `HttpPlatformHandler` IIS Module is needed.

The module serves two main purposes. Firstly, it facilitates the management of HTTP Listeners, which can include various processes that can listen on a port to receive HTTP requests (such as Tomcat, Jetty, Node.exe, Ruby, etc.). Secondly, it acts as a proxy, directing requests to the relevant process being managed.

Add a `web.config` to the `.output` directory after the build. It should look like this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="httpPlatformHandler" path="*" verb="*" modules="httpPlatformHandler" resourceType="Unspecified" requireAccess="Script" />
    </handlers>
    <httpPlatform stdoutLogEnabled="true" stdoutLogFile=".\logs\node.log" startupTimeLimit="20" processPath="C:\Program Files\nodejs\node.exe" arguments=".\server\index.mjs">
      <environmentVariables>
        <environmentVariable name="PORT" value="%HTTP_PLATFORM_PORT%" />
        <environmentVariable name="NODE_ENV" value="Production" />
      </environmentVariables>
    </httpPlatform>
  </system.webServer>
</configuration>
```

Additional `environmentVariables` can be added accordingly.

Lastly copy your `.output` directory to the Windows Server and create a website on IIS pointing to that exact directory. The copy task should also be integrated into your pipeline.