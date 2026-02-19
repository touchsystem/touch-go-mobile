package com.touchgo.mobile;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Matrix;
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

    // Largura útil da bobina 58mm. Render 2x (traço nítido) + downscale com filtro = mais qualidade.
    private static final int PRINT_WIDTH_PX = 448;
    private static final int RENDER_SCALE = 4;
    private static final int FONT_SIZE_PX = 28;
    private static final int HEADER_FONT_SIZE_PX = 36;
    private static final int LINE_SPACING_PX = 22;
    private static final int PADDING_PX = 2;

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

        // Desenho em 2x com texto nítido (sem antialiasing); depois downscale com filtro
        int fs = FONT_SIZE_PX * RENDER_SCALE;
        int hfs = HEADER_FONT_SIZE_PX * RENDER_SCALE;
        int lsp = LINE_SPACING_PX * RENDER_SCALE;
        int pad = PADDING_PX * RENDER_SCALE;

        Paint paint = new Paint();
        paint.setColor(0xFF000000);
        paint.setTypeface(Typeface.create(Typeface.MONOSPACE, Typeface.BOLD));
        paint.setFakeBoldText(true);
        paint.setSubpixelText(false);

        Paint headerPaint = new Paint(paint);
        headerPaint.setTextSize(hfs);
        paint.setTextSize(fs);

        float maxLineWidth = 0;
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            if (line != null && !line.isEmpty()) {
                float w = (i == 0) ? headerPaint.measureText(line) : paint.measureText(line);
                if (w > maxLineWidth) maxLineWidth = w;
            }
        }
        if (maxLineWidth <= 0) return null;

        int lineHeight = fs + lsp;
        int headerLineHeight = hfs + lsp;
        int contentHeight = pad * 2 + (lines.length > 0 ? headerLineHeight : 0) + (lines.length > 1 ? (lines.length - 1) * lineHeight : 0);
        int contentWidth = (int) Math.ceil(maxLineWidth) + pad * 2;

        Bitmap contentBitmap = Bitmap.createBitmap(contentWidth, contentHeight, Bitmap.Config.ARGB_8888);
        Canvas contentCanvas = new Canvas(contentBitmap);
        contentCanvas.drawColor(0xFFFFFFFF);

        // Desenho duplicado com 1px de deslocamento = texto mais grosso/escuro no térmico
        final float boldOffset = 1f;
        float y = pad + hfs;
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            if (line != null && !line.isEmpty()) {
                if (i == 0) {
                    contentCanvas.drawText(line, pad, y, headerPaint);
                    contentCanvas.drawText(line, pad + boldOffset, y, headerPaint);
                    y += headerLineHeight;
                } else {
                    contentCanvas.drawText(line, pad, y, paint);
                    contentCanvas.drawText(line, pad + boldOffset, y, paint);
                    y += lineHeight;
                }
            } else {
                y += (i == 0) ? headerLineHeight : lineHeight;
            }
        }

        // Downscale com filtro: mais detalhe (2x) + redução suave = melhor qualidade
        float scale = (float) PRINT_WIDTH_PX / contentWidth;
        int outWidth = PRINT_WIDTH_PX;
        int outHeight = (int) Math.ceil(contentHeight * scale);
        Bitmap outBitmap = Bitmap.createBitmap(outWidth, outHeight, Bitmap.Config.ARGB_8888);
        Canvas outCanvas = new Canvas(outBitmap);
        outCanvas.drawColor(0xFFFFFFFF);
        Matrix matrix = new Matrix();
        matrix.setScale(scale, scale);
        outCanvas.setMatrix(matrix);
        Paint scalePaint = new Paint(Paint.FILTER_BITMAP_FLAG);
        outCanvas.drawBitmap(contentBitmap, 0, 0, scalePaint);
        outCanvas.setMatrix(new Matrix());
        contentBitmap.recycle();

        // O PlugPag TerminalLib roda em outro processo e não acessa o cache privado do app.
        File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
        File dir = new File(downloadsDir, "smart2_print");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File file = new File(dir, "smart2_print_" + System.currentTimeMillis() + ".png");
        try (FileOutputStream fos = new FileOutputStream(file)) {
            outBitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
            return file.getAbsolutePath();
        } catch (IOException e) {
            Log.e("Smart2Print", "Erro ao gerar PNG para impressão", e);
            return null;
        } finally {
            outBitmap.recycle();
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
