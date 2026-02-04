package br.com.ActionTSystem.mercadot.pagamento;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.List;

import br.com.ActionTSystem.mercadot.App.App;
import br.com.ActionTSystem.mercadot.R;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagInitializationResult;


public class MeioDePagamentoActivity extends Activity {

    ListView listView;
    String valor;
    List<String> metodo;

    //SimpleListAdapter simpleListAdapter;

    LinearLayout linearLayoutCredito;
    LinearLayout linearLayoutDebito;
    LinearLayout linearLayoutPix;
    LinearLayout linearLayoutCancelar;
    TextView textViewValor;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_meios_pagamento_stone);

        //listView = (ListView) findViewById(R.id.listview);
        textViewValor = (TextView) findViewById(R.id.textViewValor);
        linearLayoutDebito = (LinearLayout) findViewById(R.id.linearDebito);
        linearLayoutCredito = (LinearLayout) findViewById(R.id.linearCredito);
        linearLayoutPix = (LinearLayout) findViewById(R.id.linearPix);
        linearLayoutCancelar = (LinearLayout) findViewById(R.id.linearCancelar);

        Bundle bundle = getIntent().getExtras();
        valor = bundle.getString("valor");

        Log.d("asdf" , "valor vindo do valor  " + valor);

        metodo = new ArrayList<>();

        textViewValor.setText(App.format(Float.parseFloat(valor)));

        linearLayoutDebito.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent intent = new Intent(MeioDePagamentoActivity.this, PagamentoActivity.class);

                intent.putExtra("parcela", "1");
                intent.putExtra("valor", valor);
                intent.putExtra("valororiginal", valor);
                intent.putExtra("tipo", "DEBITO");

                startActivityForResult(intent, 2);

            }
        });

        linearLayoutCredito.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent intent = new Intent(MeioDePagamentoActivity.this, PagamentoActivity.class);

                intent.putExtra("parcela", "1");
                intent.putExtra("valor", valor);
                intent.putExtra("valororiginal", valor);
                intent.putExtra("tipo", "CREDITO");

                startActivityForResult(intent, 2);

//                Intent intent = new Intent(MeioDePagamentoActivity.this, ParcelamentoActivity.class);
//
//                intent.putExtra("valor" , valor);
//
//                startActivityForResult(intent, 1);

            }
        });

        linearLayoutPix.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                Intent intent = new Intent(MeioDePagamentoActivity.this, PagamentoActivity.class);

                intent.putExtra("parcela", "1");
                intent.putExtra("valor", valor);
                intent.putExtra("valororiginal", valor);
                intent.putExtra("tipo", "PIX");

                startActivityForResult(intent, 2);

            }
        });

        linearLayoutCancelar.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent intent = new Intent();

                setResult(RESULT_CANCELED, intent);

                finish();
            }
        });

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if(requestCode == 1) {

            if(resultCode == RESULT_OK) {

                Log.d("CARRRT", " MEIO DE PAGAMENTO - RESULT CODE 1");

                Intent intent = new Intent(MeioDePagamentoActivity.this, PagamentoActivity.class);

                intent.putExtra("parcela", data.getExtras().getString("parcela"));
                intent.putExtra("valor", data.getExtras().getString("valor"));
                intent.putExtra("valororiginal", valor);
                intent.putExtra("tipo", "CREDITO");

                startActivityForResult(intent, 2);
            }else{
                finish();
            }

        }else if(requestCode == 2) {

            if(resultCode == RESULT_OK) {

                Intent intent = new Intent();

                intent.putExtra("valor" , valor);
                intent.putExtra("metodo" , data.getExtras().getString("metodo"));
                intent.putExtra("transaction" , data.getExtras().getString("transaction"));

                setResult(RESULT_OK, intent);

                finish();

            }if(resultCode == RESULT_CANCELED){
                Log.d("CARRRT" , " MEIO DE PAGAMENTO - RESULT CODE 2 CANCELED");

                Intent i = new Intent();

                setResult(RESULT_CANCELED, i);

                finish();

            }

        }
    }

}
