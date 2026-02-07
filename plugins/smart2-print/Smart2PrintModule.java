package com.touchgo.mobile;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Environment;
import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrintResult;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterData;

/**
 * Módulo nativo que imprime texto na impressora térmica da Smart2.
 * Gerado pelo plugin with-smart2-print. Usa PlugPag.printFromFile com PNG gerado do texto.
 */
public class Smart2PrintModule extends ReactContextBaseJavaModule {

    private static final int PRINT_WIDTH_PX = 384;
    private static final int FONT_SIZE_PX = 24;
    private static final int LINE_SPACING_PX = 8;
    private static final int PADDING_PX = 16;

    public Smart2PrintModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "Smart2Print";
    }

    private String textToPrintFile(String text) {
        if (text == null || text.isEmpty()) return null;
        String[] lines = text.split("\n");
        if (lines.length == 0) return null;

        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        paint.setColor(0xFF000000);
        paint.setTextSize(FONT_SIZE_PX);
        paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.NORMAL));

        int lineHeight = FONT_SIZE_PX + LINE_SPACING_PX;
        int bitmapHeight = PADDING_PX * 2 + lines.length * lineHeight;
        Bitmap bitmap = Bitmap.createBitmap(PRINT_WIDTH_PX, bitmapHeight, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);
        canvas.drawColor(0xFFFFFFFF);

        float y = PADDING_PX + FONT_SIZE_PX;
        for (String line : lines) {
            if (line != null && !line.isEmpty()) {
                canvas.drawText(line, PADDING_PX, y, paint);
            }
            y += lineHeight;
        }

        // O PlugPag TerminalLib roda em outro processo e não acessa o cache privado do app.
        // Android 11+ bloqueia criação de pastas customizadas na raiz (/sdcard/smart2_print).
        // Usar Download/smart2_print (dentro de diretório público padrão).
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File dir = new File(downloadsDir, "smart2_print");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File file = new File(dir, "smart2_print_" + System.currentTimeMillis() + ".png");
        try (FileOutputStream fos = new FileOutputStream(file)) {
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
            return file.getAbsolutePath();
        } catch (IOException e) {
            Log.e("Smart2Print", "Erro ao gerar PNG para impressão", e);
            return null;
        } finally {
            bitmap.recycle();
        }
    }

    @ReactMethod
    public void print(String text, Promise promise) {
        try {
            String filePath = textToPrintFile(text);
            if (filePath == null) {
                WritableMap out = Arguments.createMap();
                out.putBoolean("success", false);
                out.putString("message", "Falha ao gerar imagem do texto");
                promise.resolve(out);
                return;
            }

            PlugPag plugPag = new PlugPag(getReactApplicationContext());
            PlugPagPrinterData printerData = new PlugPagPrinterData(filePath, 4, 0);
            PlugPagPrintResult result = plugPag.printFromFile(printerData);

            WritableMap out = Arguments.createMap();
            out.putBoolean("success", result.getResult() == PlugPag.RET_OK);
            if (result.getMessage() != null) {
                out.putString("message", result.getMessage());
            }
            promise.resolve(out);

            new File(filePath).delete();
        } catch (Throwable t) {
            Log.e("Smart2Print", "Erro ao imprimir na Smart2", t);
            WritableMap out = Arguments.createMap();
            out.putBoolean("success", false);
            out.putString("message", t.getMessage() != null ? t.getMessage() : "Erro ao imprimir");
            promise.resolve(out);
        }
    }
}
