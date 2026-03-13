package com.touchgo.mobile;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagActivationData;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagInitializationResult;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPaymentData;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagTransactionResult;

/**
 * Módulo nativo PagSeguro Smart 2 - pagamento (crédito, débito, PIX).
 * Injetado pelo plugin with-pagseguro-smart2.
 */
public class PagSeguroSmart2Module extends ReactContextBaseJavaModule {

    private static final String TAG = "PagSeguroSmart2";

    public PagSeguroSmart2Module(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "PagSeguroSmart2";
    }

    @ReactMethod
    public void initialize(String token, Promise promise) {
        if (token == null || token.trim().isEmpty()) {
            promise.resolve(false);
            return;
        }
        new Thread(() -> {
            try {
                PagSeguroHelper.getInstance(getReactApplicationContext(), helper -> {
                    if (helper == null || helper.getPlugPag() == null) {
                        promise.resolve(false);
                        return;
                    }
                    try {
                        PlugPagActivationData activationData = new PlugPagActivationData(token.trim());
                        PlugPagInitializationResult result = helper.getPlugPag().initializeAndActivatePinpad(activationData);
                        boolean ok = (result != null && result.getResult() == PlugPag.RET_OK);
                        Log.d(TAG, "initialize result: " + (ok ? "OK" : result != null ? result.getResult() : "null"));
                        promise.resolve(ok);
                    } catch (Throwable t) {
                        Log.e(TAG, "initialize error", t);
                        promise.reject("INIT_ERROR", t.getMessage());
                    }
                });
            } catch (Throwable t) {
                Log.e(TAG, "initialize error", t);
                promise.reject("INIT_ERROR", t.getMessage());
            }
        }).start();
    }

    @ReactMethod
    public void pay(int amountInCents, String reference, String paymentType, int installments, Promise promise) {
        int type;
        switch (paymentType != null ? paymentType.toUpperCase() : "CREDITO") {
            case "DEBITO":
                type = PlugPag.TYPE_DEBITO;
                break;
            case "PIX":
                type = PlugPag.TYPE_PIX;
                break;
            default:
                type = PlugPag.TYPE_CREDITO;
        }
        int instType = (installments <= 1) ? PlugPag.INSTALLMENT_TYPE_A_VISTA : PlugPag.INSTALLMENT_TYPE_PARC_VENDEDOR;
        int instQty = Math.max(1, installments);

        String ref = (reference != null && reference.length() > 10) ? reference.substring(0, 10) : (reference != null ? reference : "");

        new Thread(() -> {
            try {
                PagSeguroHelper.getInstance(getReactApplicationContext(), helper -> {
                    if (helper == null || helper.getPlugPag() == null) {
                        promise.reject("NOT_AVAILABLE", "PlugPag não inicializado");
                        return;
                    }
                    try {
                        PlugPagPaymentData paymentData = new PlugPagPaymentData(
                                type, amountInCents, instType, instQty, ref, false
                        );
                        PlugPagTransactionResult result = helper.getPlugPag().doPayment(paymentData);
                        if (result != null && result.getResult() == PlugPag.RET_OK) {
                            WritableMap map = Arguments.createMap();
                            map.putBoolean("success", true);
                            map.putString("transactionId", result.getTransactionId() != null ? result.getTransactionId() : "");
                            map.putString("transactionCode", result.getTransactionCode() != null ? result.getTransactionCode() : "");
                            map.putInt("amountInCents", amountInCents);
                            map.putString("reference", ref);
                            promise.resolve(map);
                        } else {
                            String msg = result != null && result.getMessage() != null ? result.getMessage() : "Erro no pagamento";
                            promise.reject("PAYMENT_ERROR", msg);
                        }
                    } catch (Throwable t) {
                        Log.e(TAG, "pay error", t);
                        promise.reject("PAYMENT_ERROR", t.getMessage());
                    }
                });
            } catch (Throwable t) {
                Log.e(TAG, "pay error", t);
                promise.reject("PAYMENT_ERROR", t.getMessage());
            }
        }).start();
    }

    @ReactMethod
    public void refund(String transactionId, int amountInCents, Promise promise) {
        // Estorno: implementar quando necessário (doRefund no SDK)
        promise.reject("NOT_IMPLEMENTED", "Estorno ainda não implementado no módulo nativo");
    }

    @ReactMethod
    public void isAvailable(Promise promise) {
        try {
            PagSeguroHelper.getInstance(getReactApplicationContext(), helper -> {
                boolean available = (helper != null && helper.getPlugPag() != null);
                promise.resolve(available);
            });
        } catch (Throwable t) {
            promise.resolve(false);
        }
    }
}
