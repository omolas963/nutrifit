package com.nutrifit.app;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@CapacitorPlugin(name = "AppUpdate")
public class AppUpdatePlugin extends Plugin {

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.isEmpty()) {
            call.reject("URL no proporcionada.");
            return;
        }

        Context ctx = getContext();

        // Check if permission to install unknown apps is granted on Android 8+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!ctx.getPackageManager().canRequestPackageInstalls()) {
                Intent settingsIntent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                settingsIntent.setData(Uri.parse("package:" + ctx.getPackageName()));
                settingsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(settingsIntent);
                call.reject("Por favor, activa el permiso para instalar actualizaciones de NutriFit y vuelve a pulsar el botón.");
                return;
            }
        }

        // Run download and launch installer in background thread
        new Thread(() -> {
            try {
                URL url = new URL(apkUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setInstanceFollowRedirects(true);
                conn.connect();

                int responseCode = conn.getResponseCode();
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    call.reject("Error al descargar archivo: HTTP " + responseCode);
                    return;
                }

                int fileLength = conn.getContentLength();
                File cacheDir = ctx.getExternalCacheDir() != null ? ctx.getExternalCacheDir() : ctx.getCacheDir();
                File apkFile = new File(cacheDir, "NutriFit-update.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                try (InputStream input = conn.getInputStream();
                     FileOutputStream output = new FileOutputStream(apkFile)) {
                    byte[] data = new byte[8192];
                    int count;
                    long total = 0;
                    long lastEmitTime = 0;

                    while ((count = input.read(data)) != -1) {
                        total += count;
                        output.write(data, 0, count);

                        long now = System.currentTimeMillis();
                        if (now - lastEmitTime > 250 && fileLength > 0) {
                            lastEmitTime = now;
                            int progress = (int) ((total * 100) / fileLength);
                            JSObject progressObj = new JSObject();
                            progressObj.put("progress", progress);
                            notifyListeners("downloadProgress", progressObj);
                        }
                    }
                    output.flush();
                }

                // File is downloaded. Trigger Android package installer popup!
                Uri apkUri = FileProvider.getUriForFile(
                    ctx,
                    ctx.getPackageName() + ".fileprovider",
                    apkFile
                );

                Intent installIntent = new Intent(Intent.ACTION_VIEW);
                installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                installIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

                ctx.startActivity(installIntent);

                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("message", "Instalador iniciado con éxito.");
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("Fallo al descargar e instalar: " + e.getMessage());
            }
        }).start();
    }
}
