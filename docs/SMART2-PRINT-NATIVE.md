# Implementar impressão na Smart2 no módulo nativo Android

A mensagem **"Impressão na Smart2 não implementada no módulo nativo"** aparece porque o `PagSeguroSmart2Module` ainda não expõe o método `print(String text)` para o React Native. O SDK PlugPag imprime a partir de **arquivo de imagem** (PNG), então é preciso converter o texto em imagem e chamar `printFromFile`.

---

## 1. Onde fica o módulo

O módulo nativo fica no projeto Android (pasta `android/` gerada pelo `npx expo prebuild` ou no seu projeto nativo). Exemplo de caminho:

- `android/app/src/main/java/com/touchgo/mobile/PagSeguroSmart2Module.java` (ou `.kt`)

Se você usa um projeto Android separado ou outro package, ajuste o caminho.

---

## 2. Dependências no `build.gradle`

No `android/app/build.gradle` (ou no módulo que usa o SDK), confirme a dependência do PlugPag:

```gradle
dependencies {
    implementation 'br.com.uol.pagseguro.plugpagservice.wrapper:wrapper:1.27.2'  // ou versão mais recente
    // ...
}
```

E no `android/build.gradle` (repositório):

```gradle
allprojects {
    repositories {
        maven { url 'https://github.com/pagseguro/PlugPagServiceWrapper/raw/master' }
        // ...
    }
}
```

---

## 3. Código para adicionar ao módulo

### 3.1. Imports adicionais no `PagSeguroSmart2Module`

Adicione (se ainda não tiver):

```java
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPag;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrintResult;
import br.com.uol.pagseguro.plugpagservice.wrapper.PlugPagPrinterData;
```

(Use o mesmo `PlugPag` / Helper que você já usa para pagamento.)

### 3.2. Método que converte texto em arquivo PNG

```java
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

    File cacheDir = getReactApplicationContext().getCacheDir();
    File file = new File(cacheDir, "smart2_print_" + System.currentTimeMillis() + ".png");
    try (FileOutputStream fos = new FileOutputStream(file)) {
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, fos);
        return file.getAbsolutePath();
    } catch (IOException e) {
        Log.e("PagSeguroSmart2", "Erro ao gerar PNG para impressão", e);
        return null;
    } finally {
        bitmap.recycle();
    }
}
```

### 3.3. Método exposto ao React Native (`@ReactMethod`)

Adicione o método que o JS chama como `print(text)`:

```java
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

        // Usar a mesma instância PlugPag que você usa para pagamento (ex.: PagSeguroHelper.getPlugPag())
        PlugPag plugPag = PagSeguroHelper.getPlugPag(getReactApplicationContext()); // ajuste conforme seu Helper
        PlugPagPrinterData printerData = new PlugPagPrinterData(filePath, 4, 0);
        PlugPagPrintResult result = plugPag.printFromFile(printerData);

        WritableMap out = Arguments.createMap();
        out.putBoolean("success", result.getResult() == PlugPag.RET_OK);
        if (result.getMessage() != null) {
            out.putString("message", result.getMessage());
        }
        promise.resolve(out);

        new File(filePath).delete(); // opcional: apagar o arquivo após imprimir
    } catch (Throwable t) {
        Log.e("PagSeguroSmart2", "Erro ao imprimir na Smart2", t);
        WritableMap out = Arguments.createMap();
        out.putBoolean("success", false);
        out.putString("message", t.getMessage() != null ? t.getMessage() : "Erro ao imprimir");
        promise.resolve(out);
    }
}
```

**Importante:** troque `PagSeguroHelper.getPlugPag(getReactApplicationContext())` pelo jeito que você obtém a instância de `PlugPag` no seu projeto (por exemplo, se for singleton, use `PagSeguroHelper.getInstance().getPlugPag()` ou o que estiver no seu código). O SDK usa `plugPag.printFromFile(PlugPagPrinterData)`.

---

## 4. Registrar o método no React Native

O React Native descobre métodos com `@ReactMethod`. Certifique-se de que a classe do módulo está registrada no Package e no `MainApplication` (como você já fez para `initialize`, `pay`, `isAvailable`). Não é preciso registrar `print` manualmente além de declarar o método com `@ReactMethod`.

---

## 5. Testar

1. Recompile o app Android e instale no dispositivo (com a Smart2 conectada/ativa).
2. No app, abra **Configurações** e na seção **Smart2 / Impressora térmica** toque em **Imprimir teste na Smart2**.
3. Se tudo estiver certo, o termo "Impressão térmica" passará a aparecer como **disponível** e o teste deve imprimir na térmica da Smart2.

Se der erro de compilação (por exemplo, `PlugPagPrinterData` ou `printFromFile` com assinatura diferente), confira a versão do wrapper no [repositório oficial](https://github.com/pagseguro/pagseguro-sdk-plugpagservicewrapper) e a documentação do PagBank para a API exata de impressão.
