package br.com.ActionTSystem.mercadot.pagamento;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;

import androidx.annotation.Nullable;

import br.com.ActionTSystem.mercadot.R;

import static java.lang.Thread.sleep;

public class PagamentoRealizadoActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pagamento_realizado);

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Log.d("xxxxx" , "entrou");
                    sleep(4000);
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            setResult(RESULT_OK);
                            finish();
                        }
                    });
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }).start();

    }
}
