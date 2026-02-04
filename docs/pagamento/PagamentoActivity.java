package br.com.ActionTSystem.mercadot.pagamento;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;

import java.math.BigDecimal;
import java.math.RoundingMode;

import br.com.ActionTSystem.mercadot.App.App;
import br.com.ActionTSystem.mercadot.R;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventData;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagEventListener;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPaymentData;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagTransactionResult;

import static br.com.uol.pagseguro.plugpag.IPlugPag.TYPE_PIX;
import static br.com.uol.pagseguro.plugpag.PlugPag.INSTALLMENT_TYPE_A_VISTA;
import static br.com.uol.pagseguro.plugpag.PlugPag.TYPE_CREDITO;
import static br.com.uol.pagseguro.plugpag.PlugPag.TYPE_DEBITO;


public class PagamentoActivity extends Activity {

    String parcela;
    String valor;
    String valorParcelado;
    String tipo;
    int type;

    TextView textView;
    TextView textValor;
    TextView textViewX;
    ImageView imageView;
    String senha = "";

    int tirarCartao = 0;
    int retirar = 0;

    String valorOriginal;
    String userReference;

    String transactioncode = "";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inserir_cartao);

        textView = (TextView) findViewById(R.id.textViewMessage);
        textValor = (TextView) findViewById(R.id.textViewValor);
        imageView = (ImageView) findViewById(R.id.imageView);
        textViewX = (TextView) findViewById(R.id.textViewX);

        Bundle bundle = getIntent().getExtras();

        valor = bundle.getString("valor");
        valorParcelado = valor;
        parcela = bundle.getString("parcela");
        tipo = bundle.getString("tipo");

        valorOriginal = getIntent().getExtras().getString("valororiginal");

        String val =  valor;

        val = val.replace(",","");
        val = val.replace("R$", "");
        val = val.replace(".", "");

        Log.d("asdf" , "valororiginal   " + val);

        if(val.length() > 9)
            val = val.substring(0,8);

        if(val.length() == 8) {
            userReference = val;
        }else{
            while (val.length() < 9){
                val = "0" + val;
            }
            //userReference = "WC-" + val + "10001";
            userReference = val;
        }

        Log.d("asdf" , "parcela   " + parcela);
        Log.d("asdf" , "valor   " + valor);
        Log.d("asdf" , "tipo   " + tipo);

        BigDecimal big;
        BigDecimal big2;

        big = BigDecimal.valueOf(Float.parseFloat(valor));

        big2 = big;

        //big2 = BigDecimal.valueOf(Float.parseFloat(valor.substring(0, valor.length()-3)));

        //big2 = big2.divide(BigDecimal.valueOf(100));

        big = big.setScale(2, RoundingMode.HALF_EVEN);

        //big = big.multiply(BigDecimal.valueOf(100));

        valor = String.valueOf(big);

        if(tipo.equals("DEBITO")){
            textViewX.setText("1x");
            textValor.setText(App.format(Float.parseFloat(String.valueOf(big2))));
            //textViewTotal.setText(App.format(Float.parseFloat(String.valueOf(big2))));
            type = TYPE_DEBITO;
        }else if(tipo.equals("CREDITO")){
            textViewX.setText(parcela +"x ");
            textValor.setText(App.format(Float.parseFloat(String.valueOf(big2))));
            //textViewTotal.setText(App.formatNumber(big2.multiply(BigDecimal.valueOf(Float.parseFloat(parcela)))));
            valor = String.valueOf(big2.multiply(BigDecimal.valueOf(Float.parseFloat(parcela))).setScale(2,BigDecimal.ROUND_HALF_UP));
            type = TYPE_CREDITO;
        }else if(tipo.equals("PIX")){
            textValor.setText(App.format(Float.parseFloat(String.valueOf(big2))));
            type = TYPE_PIX;
        }


        PagSeguroHelper.getInstance(this, new PagSeguroHelper.GetInstance() {
                @Override
                public void gotInstance(final PagSeguroHelper pagSeguroHelper) {

                    new Thread() {
                        @Override
                        public void run() {
                            super.run();

                            try {
                                pagSeguroHelper.getPlugPag().setEventListener(new PlugPagEventListener() {
                                    @Override
                                    public void onEvent(PlugPagEventData plugPagEventData) {

                                        Log.d("CARRRTT", "EVENT  : " + plugPagEventData.getEventCode());
                                        Log.d("CARRRTT" , "retirar  " + String.valueOf(retirar));

                                        switch (plugPagEventData.getEventCode()) {

                                            case PlugPagEventData.EVENT_CODE_SALE_APPROVED:

                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        textView.setText("RETIRAR CARTÃO");
                                                        imageView.setVisibility(View.VISIBLE);
                                                        imageView.setImageResource(R.drawable.remove_credit_card);

                                                    }
                                                });
                                                retirar = 5;
                                                break;


                                            case PlugPagEventData.EVENT_CODE_CUSTOM_MESSAGE:

                                                Log.d("CARRRT", "EVENT_CODE_CUSTOM_MESSAGE");

                                                if (tirarCartao == 1 && retirar <= 1) {

                                                    runOnUiThread(new Runnable() {
                                                        @Override
                                                        public void run() {
                                                            textView.setText("AGUARDE...");

                                                            imageView.setVisibility(View.VISIBLE);

                                                            imageView.setImageResource(R.drawable.ic_timer_black_24dp);

                                                        }
                                                    });

                                                    retirar++;

                                                } else if (tirarCartao == 1 && retirar >= 2) {

                                                    runOnUiThread(new Runnable() {
                                                        @Override
                                                        public void run() {
                                                            textView.setText("RETIRAR CARTÃO");
                                                            imageView.setVisibility(View.VISIBLE);
                                                            imageView.setImageResource(R.drawable.remove_credit_card);

                                                        }
                                                    });
                                                } else {

                                                    runOnUiThread(new Runnable() {
                                                        @Override
                                                        public void run() {
                                                            textView.setText("INSIRA O SEU CARTÃO");

                                                            imageView.setImageResource(R.drawable.insert_credit_card);

                                                            imageView.setVisibility(View.VISIBLE);

                                                        }
                                                    });
                                                }
                                                break;

                                            case PlugPagEventData.EVENT_CODE_INSERTED_CARD:

                                                Log.d("CARRRT", "EVENT_CODE_INSERTED_CARD");

                                                break;

                                            case PlugPagEventData.EVENT_CODE_DIGIT_PASSWORD:

                                                Log.d("CARRRT", "EVENT_CODE_DIGIT_PASSWORD");
                                                tirarCartao = 1;
                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        imageView.setVisibility(View.INVISIBLE);
                                                        senha = senha + "*";
                                                        textView.setText("SENHA \n" + senha);
                                                    }
                                                });

                                                //insercao da senha / 1 digito
                                                break;

                                            case PlugPagEventData.EVENT_CODE_PIN_REQUESTED:

                                                Log.d("CARRRT", "EVENT_CODE_PIN_REQUESTED ");

                                                tirarCartao = 1;

                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        textView.setText("DIGITE A SENHA");
                                                    }
                                                });

                                                //pedindo a senha

                                                break;

                                            case PlugPagEventData.EVENT_CODE_NO_PASSWORD:

                                                Log.d("CARRRT", "EVENT_CODE_NO_PASSWORD");

                                                tirarCartao = 1;
                                                retirar = 0;

                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {

                                                        //imageView.setVisibility(View.INVISIBLE);

                                                        if (senha.length() > 1) {

                                                            senha = senha.substring(0, senha.length() - 1);
                                                            textView.setText("SENHA \n" + senha);

                                                        } else {

                                                            senha = "";
                                                            textView.setText("SENHA\n");

                                                        }
                                                    }
                                                });

                                                //deletar 1 digito da senha
                                                break;

                                            case PlugPagEventData.EVENT_CODE_PIN_OK:

                                                Log.d("CARRRT", "EVENT_CODE_PIN_OK");

                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        textView.setText("PAGAMENTO CONFIRMADO.");
                                                    }
                                                });

                                                //a senha deu certo

                                                break;

                                            case PlugPagEventData.EVENT_CODE_WAITING_REMOVE_CARD:
                                                retirar = 5;
                                                tirarCartao = 1;

                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        imageView.setImageResource(R.drawable.remove_credit_card);
                                                        textView.setText("REMOVA O CARTÃO");
                                                    }
                                                });
                                                break;

                                            case PlugPagEventData.EVENT_CODE_AUTHORIZING:

                                                retirar = 0;
                                                tirarCartao = 1;

                                                break;

                                            case PlugPagEventData.EVENT_CODE_REMOVED_CARD:

                                                Log.d("CARRRT", "EVENT_CODE_REMOVED_CARD");

                                                runOnUiThread(new Runnable() {
                                                    @Override
                                                    public void run() {
                                                        imageView.setImageResource(R.drawable.remove_credit_card);
                                                        textView.setText("REMOVA O CARTÃO");
                                                        retirar = 5;
                                                    }
                                                });

                                                // remover cartao

                                                break;

                                            case PlugPagEventData.ON_EVENT_ERROR:

                                                Log.d("CARRRT", "ON_EVENT_ERROR");

                                                break;
                                        }

                                    }
                                });

                                // tipo pagamento, valor total, pagamento vista ou prazo para comprador, numero de prestação /indice,
                                // user reference pode ser qualquer merda, payment ceceipt imprimir comprovante
                                final PlugPagPaymentData plugPagPaymentData = new PlugPagPaymentData(
                                        type,
                                        Integer.parseInt(valor.replace(".","")),
                                        INSTALLMENT_TYPE_A_VISTA,
                                        Integer.parseInt(parcela),
                                        userReference,
                                        true
                                );

                                final PlugPagTransactionResult result = pagSeguroHelper.getPlugPag().doPayment(plugPagPaymentData);

                                Log.d("CARRRRRRT", result.toString());

                                if (result.getResult() == 0) {

                                    Log.d("CARRRRRRT", result.getCardApplication());
                                    Log.d("CARRRRRRT", "transaction code : " + result.getTransactionCode());
                                    Log.d("CARRRRRRT", "transaction id : " + result.getTransactionId());


                                    final PlugPagTransactionResult resultfinal = result;

                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {

                                            Toast.makeText(PagamentoActivity.this, "OPERAÇÃO CONCLUIDA", Toast.LENGTH_SHORT).show();

                                            transactioncode = resultfinal.getTransactionCode();

                                            Intent intent = new Intent(PagamentoActivity.this, PagamentoRealizadoActivity.class);

                                            startActivityForResult(intent, 2);

                                        }
                                    });
                                } else {
                                    Log.d("CARRRT", "OPERACAO CANCELADA");

                                    runOnUiThread(new Runnable() {
                                        @Override
                                        public void run() {

                                            try {

                                                AlertDialog.Builder builder = new AlertDialog.Builder(PagamentoActivity.this);
                                                builder.setTitle("OPERAÇÃO CANCELADA");
                                                builder.setMessage("Motivo: " + result.getMessage())
                                                        .setCancelable(false)
                                                        .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                                                            public void onClick(DialogInterface dialog, int id) {
                                                                finish();
                                                            }
                                                        });
                                                AlertDialog alert = builder.create();
                                                alert.show();

                                            }catch (Exception e){
                                                e.printStackTrace();
                                            }

                                        }
                                    });

                                }
                            }catch (Exception e){
                                e.printStackTrace();
                            }

                        }
                    }.start();
                }
            });
    }

    @Override
    public void onBackPressed() {

        Log.d("CARRRT" , "ON BACK PRESSED");

        Intent intent = new Intent();

        setResult(RESULT_CANCELED, intent);

        PagSeguroHelper.getInstance(this, new PagSeguroHelper.GetInstance() {
            @Override
            public void gotInstance(final PagSeguroHelper pagSeguroHelper) {
                new Thread(){
                    @Override
                    public void run() {
                        super.run();

                            pagSeguroHelper.getPlugPag().abort();
                    }
                }.start();
            }
        });

        finish();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if(requestCode == 2){
            if(resultCode == RESULT_OK){

                Intent intent = new Intent();

                intent.putExtra("valor" , valor);
                intent.putExtra("metodo" , type);
                intent.putExtra("transaction" , transactioncode);

                setResult(RESULT_OK, intent);
                finish();
            }
        }
    }
}
