package com.touchgo.mobile;

import android.content.Context;
import android.util.Log;

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;

/**
 * Singleton do PlugPag. Usado pelo PagSeguroSmart2Module.
 */
public class PagSeguroHelper {

    public static final String TAG = "PagSeguroSmart2";

    private static PagSeguroHelper instance;
    private PlugPag plugPag;
    private Context context;

    public static void getInstance(final Context context, final GetInstance callback) {
        if (instance == null) {
            Log.d(TAG, "Creating new PlugPag instance");
            instance = new PagSeguroHelper();
            instance.context = context.getApplicationContext();
            new Thread(() -> {
                try {
                    instance.plugPag = new PlugPag(instance.context);
                    Log.d(TAG, "PlugPag instance created");
                    callback.gotInstance(instance);
                } catch (Throwable t) {
                    Log.e(TAG, "Error creating PlugPag", t);
                    callback.gotInstance(null);
                }
            }).start();
        } else {
            Log.d(TAG, "Using existing PlugPag instance");
            callback.gotInstance(instance);
        }
    }

    public PlugPag getPlugPag() {
        return plugPag;
    }

    public interface GetInstance {
        void gotInstance(PagSeguroHelper helper);
    }
}
