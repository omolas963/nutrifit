package com.nutrifit.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import com.nutrifit.app.R;

import java.text.NumberFormat;
import java.util.Locale;

public class NutriFitWidgetProvider extends AppWidgetProvider {

    public static final String PREFS_NAME = "NutriFitWidgetPrefs";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    public static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);

        int remaining = prefs.getInt("caloriesRemaining", 2250);
        int target = prefs.getInt("caloriesTarget", 2250);
        int consumed = prefs.getInt("caloriesConsumed", 0);
        int steps = prefs.getInt("steps", 0);
        float waterLiters = prefs.getFloat("waterLiters", 0.0f);
        String updatedTime = prefs.getString("updatedTime", "Hoy");

        NumberFormat nf = NumberFormat.getInstance(new Locale("es", "ES"));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.nutrifit_widget);

        // Update texts
        views.setTextViewText(R.id.widget_kcal_remaining, nf.format(remaining) + " kcal");
        views.setTextViewText(R.id.widget_kcal_subtext, "restantes de " + nf.format(target) + " (" + nf.format(consumed) + " consumidas)");
        views.setTextViewText(R.id.widget_steps_text, nf.format(steps) + " pasos");
        views.setTextViewText(R.id.widget_water_text, String.format(Locale.US, "%.1f L", waterLiters));
        views.setTextViewText(R.id.widget_updated_time, updatedTime);

        // Tap to open app
        Intent openAppIntent = new Intent(context, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                0,
                openAppIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);
        views.setOnClickPendingIntent(R.id.widget_add_btn, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void updateAllWidgets(Context context) {
        try {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName widgetComponent = new ComponentName(context, NutriFitWidgetProvider.class);
            int[] widgetIds = manager.getAppWidgetIds(widgetComponent);
            if (widgetIds != null && widgetIds.length > 0) {
                for (int id : widgetIds) {
                    updateAppWidget(context, manager, id);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
