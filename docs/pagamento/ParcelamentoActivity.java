package br.com.ActionTSystem.mercadot.pagamento;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import org.json.JSONException;
import org.json.JSONObject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import br.com.ActionTSystem.mercadot.App.App;
import br.com.ActionTSystem.mercadot.R;


public class ParcelamentoActivity extends Activity {

    List<String> retorno;
    ListView listView;

    SimpleListAdapter adapter;
    String valor;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_parcelamento);

        listView = (ListView) findViewById(R.id.listview);

        adapter = new SimpleListAdapter();

        listView.setAdapter(adapter);

        Bundle bundle = getIntent().getExtras();

        valor = bundle.getString("valor");

        retorno = new ArrayList<>();

        JSONObject jsonObject = new JSONObject();

        try {
            jsonObject.put("value", valor);
            jsonObject.put("type", "credit");
        } catch (JSONException e) {
            e.printStackTrace();
        }

        final ProgressDialog progressDialog = new ProgressDialog(ParcelamentoActivity.this);

        progressDialog.setMessage("AGUARDE");

        progressDialog.show();

        PagSeguroHelper.getInstance(this, new PagSeguroHelper.GetInstance() {
            @Override
            public void gotInstance(final PagSeguroHelper pagSeguroHelper) {

                new Thread(){
                    @Override
                    public void run() {
                        super.run();
                        retorno = Arrays.asList(pagSeguroHelper.getPlugPag().calculateInstallments(valor));

                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {

                                progressDialog.dismiss();
                                reload();
                            }
                        });

                    }
                }.start();
            }
        });


        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {

                Intent intent = new Intent();

                intent.putExtra("parcela" , retorno.get(i));
                intent.putExtra("valor", String.valueOf(BigDecimal.valueOf(Float.parseFloat(retorno.get(i))).setScale(2,RoundingMode.HALF_UP)));

                setResult(RESULT_OK, intent);

                finish();

            }
        });

    }

    void reload(){

        adapter.notifyDataSetChanged();

    }

    class SimpleListAdapter extends ArrayAdapter<String> {

        public SimpleListAdapter() {
            super(ParcelamentoActivity.this, R.layout.text_list_item_pag_parc);
        }

        @Override
        public int getCount() {

            if(retorno == null) return 0;

            return retorno.size();
        }

        @NonNull
        @Override
        public View getView(int position, @Nullable View convertView, @NonNull ViewGroup parent) {

            ViewHolder holder = new ViewHolder();

            if(convertView == null){

                convertView = getLayoutInflater().inflate(R.layout.text_list_item_pag_parc, null);

                holder.textView = convertView.findViewById(R.id.textView);
                holder.textViewX = convertView.findViewById(R.id.textViewX);

                convertView.setTag(holder);

            }else{

                holder = (ViewHolder) convertView.getTag();

            }

            try {

                String g = retorno.get(position);

                if (g != null) {

                    BigDecimal big;

                    big = BigDecimal.valueOf(Float.parseFloat(g));

                    //big = big.divide(BigDecimal.valueOf(100));

                    big = big.setScale(2, RoundingMode.HALF_EVEN);

                    holder.textViewX.setText(g + "x");

                    holder.textView.setText(App.formatNumber(big));

                    BigDecimal total = BigDecimal.ZERO;

                    total = total.add(BigDecimal.valueOf(Float.parseFloat(String.valueOf(position+1))).multiply(big));


                }

            }catch (Exception e){

                e.printStackTrace();

            }

            return  convertView;

        }
    }

    class ViewHolder {

        TextView textView;
        TextView textViewX;

    }
}
