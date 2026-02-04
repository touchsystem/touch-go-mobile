package br.com.ActionTSystem.mercadot.App;

import android.util.Log;
import android.widget.Toast;

import br.com.ActionTSystem.mercadot.Data.Campos.Configuracoes;
import br.com.ActionTSystem.mercadot.pagamento.MeioDePagamentoActivity;
import br.com.ActionTSystem.mercadot.pagamento.PagSeguroHelper;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagInitializationResult;

import static java.lang.Thread.sleep;

public class AppPagSeguro extends App {

    @Override
    public void onCreate() {
        super.onCreate();

        Log.d("asdf" , "AppàgSeguro");

        PagSeguroHelper.initialize(this);

        if(!tokenPagSeguro().equals("")) {

            ativar();

        }

    }

    public static String tokenPagSeguro(){
        try{

            Configuracoes config = App.data.configuracoes.queryForAll().get(0);

            if(config.getCodigoPagSeguro() == null)
                return "";

            return  config.getCodigoPagSeguro();

        }catch (Exception e){
            e.printStackTrace();
        }

        return "";
    }

    public static void ativar(){

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {

                    sleep(10000);

                    PagSeguroHelper.getInstance(context.getApplicationContext(), new PagSeguroHelper.GetInstance() {
                        @Override
                        public void gotInstance(final PagSeguroHelper pagSeguroHelper) {

                            new Thread(new Runnable() {
                                @Override
                                public void run() {
                                    try {
                                        //final PlugPagActivationData plugPagActivationData = new PlugPagActivationData("749879");
                                        final PlugPagActivationData plugPagActivationData = new PlugPagActivationData(tokenPagSeguro());

                                        final PlugPagInitializationResult res = pagSeguroHelper.getPlugPag().initializeAndActivatePinpad(plugPagActivationData);

                                        Log.d("asdf", String.valueOf(res.getResult()));

                                        if (res.getResult() == PlugPag.RET_OK) {

                                            Log.d("asdf", "INSTANCIADO");

                                        } else {

                                            Log.d("asdf", "FALHOU");

                                        }

                                    } catch (Exception e) {
                                        e.printStackTrace();
                                    }
                                }
                            }).start();


                        }
                    });

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();

    }
}
