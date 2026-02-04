package br.com.ActionTSystem.mercadot.pagamento;

import android.content.Context;
import android.util.Log;

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;

public class PagSeguroHelper {

    public static final String TAG = "RECEB_PLUG";

    public static PagSeguroHelper instance;

    PlugPag plugPag;

    private Context context;

    public static void initialize(Context context){

        getInstance(context, new GetInstance() {
            @Override
            public void gotInstance(PagSeguroHelper pagSeguroHelper) {

            }
        });

    }

    public static void getInstance(final Context context, final GetInstance getInstance) {

        if(instance == null) {

            Log.d(TAG, "new Instance");

            instance = new PagSeguroHelper();

            Log.d(TAG, "new Instance 2");

            instance.context = context;

            Log.d(TAG, "new Instance 3");

            new Thread() {
                @Override
                public void run() {

                    super.run();

                    Log.d(TAG, "new Instance 5");

                    //instance.plugPag = new PlugPag(context, new PlugPagAppIdentification(BuildConfig.APPLICATION_ID, "3.1.1"));
                    instance.plugPag = new PlugPag(context);

                    Log.d(TAG, "callback");

                    getInstance.gotInstance(instance);


                }
            }.start();

        }else{

            Log.d(TAG, "old instance");

            getInstance.gotInstance(instance);

        }
    }


    public static void setInstance(PagSeguroHelper instance) {
        PagSeguroHelper.instance = instance;
    }

    public PlugPag getPlugPag() {
        return plugPag;
    }

    public PagSeguroHelper setPlugPag(PlugPag plugPag) {
        this.plugPag = plugPag;
        return this;
    }

    public interface GetInstance{
        void gotInstance(PagSeguroHelper pagSeguroHelper);
    }

}
