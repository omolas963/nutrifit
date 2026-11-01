package com.nutrifit.app;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

@CapacitorPlugin(name = "NutriFitWidget")
public class NutriFitWidgetPlugin extends Plugin {

    @PluginMethod
    public void updateWidgetData(PluginCall call) {
        try {
            int remaining = call.getInt("caloriesRemaining", 2250);
            int target = call.getInt("caloriesTarget", 2250);
            int consumed = call.getInt("caloriesConsumed", 0);
            int steps = call.getInt("steps", 0);
            Double waterDouble = call.getDouble("waterLiters", 0.0);
            float waterLiters = waterDouble != null ? waterDouble.floatValue() : 0.0f;

            String timeStr = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date());

            Context ctx = getContext();
            SharedPreferences prefs = ctx.getSharedPreferences(NutriFitWidgetProvider.PREFS_NAME, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();

            editor.putInt("caloriesRemaining", remaining);
            editor.putInt("caloriesTarget", target);
            editor.putInt("caloriesConsumed", consumed);
            editor.putInt("steps", steps);
            editor.putFloat("waterLiters", waterLiters);
            editor.putString("updatedTime", timeStr);
            editor.apply();

            // Refresh all widgets on the home screen immediately
            NutriFitWidgetProvider.updateAllWidgets(ctx);

            JSObject ret = new JSObject();
            ret.put("success", true);
            ret.put("updatedAt", timeStr);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error updating widget: " + e.getMessage());
        }
    }
}
