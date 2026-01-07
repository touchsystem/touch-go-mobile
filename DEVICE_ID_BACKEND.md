# 📱 Sistema de Controle de Dispositivos - Documentação Backend

## 🎯 Objetivo
Permitir que o sistema bloqueie/autorize dispositivos móveis específicos via painel administrativo.

---

## 📥 1. O QUE O BACKEND RECEBE DO MOBILE

### 1.1. No Login (POST /login)

```json
{
  "email": "usuario@email.com",
  "senha": "senha123",
  "deviceId": "a1b2c3d4e5f6g7h8",  // ← ID único do dispositivo
  "deviceInfo": {                    // ← Informações para exibir no painel
    "deviceName": "iPhone de João",
    "modelName": "iPhone 14 Pro",
    "osName": "iOS",
    "osVersion": "17.2",
    "platform": "ios",
    "appVersion": "1.0.0"
  }
}
```

### 1.2. Em Todas as Requisições (Header)

```http
Authorization: Bearer <token>
X-User-ID: 123
X-Device-ID: a1b2c3d4e5f6g7h8  ← Device ID em todas as requisições
```

---

## 🗄️ 2. ESTRUTURA DO BANCO DE DADOS

### Tabela: `DISPOSITIVOS_AUTORIZADOS`

```sql
CREATE TABLE DISPOSITIVOS_AUTORIZADOS (
  ID INT PRIMARY KEY AUTO_INCREMENT,
  DEVICE_ID VARCHAR(255) NOT NULL UNIQUE,
  ID_USU INT NULL,                    -- Usuário que fez primeiro login
  DEVICE_NAME VARCHAR(255) NULL,
  MODEL_NAME VARCHAR(255) NULL,
  OS_NAME VARCHAR(50) NULL,
  OS_VERSION VARCHAR(50) NULL,
  PLATFORM VARCHAR(20) NULL,
  APP_VERSION VARCHAR(50) NULL,
  STATUS VARCHAR(1) DEFAULT 'A',      -- A = Ativo, B = Bloqueado
  DATA_PRIMEIRO_LOGIN DATETIME NULL,
  DATA_ULTIMO_LOGIN DATETIME NULL,
  DATA_BLOQUEIO DATETIME NULL,
  MOTIVO_BLOQUEIO TEXT NULL,
  BLOQUEADO_POR INT NULL,             -- ID do usuário admin que bloqueou
  CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
  UPDATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_device_id (DEVICE_ID),
  INDEX idx_status (STATUS),
  INDEX idx_id_usu (ID_USU),
  FOREIGN KEY (ID_USU) REFERENCES USUARIOS(ID),
  FOREIGN KEY (BLOQUEADO_POR) REFERENCES USUARIOS(ID)
);
```

---

## 🔧 3. LÓGICA DO BACKEND

### 3.1. Endpoint de Login (POST /login)

```go
func Login(w http.ResponseWriter, r *http.Request) {
    var loginData struct {
        Email      string `json:"email"`
        Senha      string `json:"senha"`
        DeviceId   string `json:"deviceId"`
        DeviceInfo struct {
            DeviceName string `json:"deviceName"`
            ModelName  string `json:"modelName"`
            OsName     string `json:"osName"`
            OsVersion  string `json:"osVersion"`
            Platform   string `json:"platform"`
            AppVersion string `json:"appVersion"`
        } `json:"deviceInfo"`
    }

    // 1. Decodifica o JSON
    json.NewDecoder(r.Body).Decode(&loginData)

    // 2. Valida email e senha (seu código existente)
    usuario, err := ValidarCredenciais(loginData.Email, loginData.Senha)
    if err != nil {
        http.Error(w, "Credenciais inválidas", http.StatusUnauthorized)
        return
    }

    // 3. NOVA LÓGICA: Valida o dispositivo
    if loginData.DeviceId != "" {
        // Verifica se o dispositivo está na tabela
        dispositivo, err := BuscarDispositivoPorId(loginData.DeviceId)
        
        if err != nil {
            // Dispositivo não encontrado, primeiro acesso
            // Registra automaticamente como ATIVO
            err = RegistrarDispositivo(loginData.DeviceId, usuario.ID, loginData.DeviceInfo)
            if err != nil {
                log.Printf("Erro ao registrar dispositivo: %v", err)
            }
        } else {
            // Dispositivo já existe, verifica se está bloqueado
            if dispositivo.Status == "B" {
                RespostaBloqueio(w, dispositivo)
                return // ← BLOQUEIA O LOGIN
            }
            
            // Atualiza último login e informações do dispositivo
            AtualizarUltimoLogin(loginData.DeviceId, loginData.DeviceInfo)
        }
    }

    // 4. Continua com o login normal (gerar token, etc.)
    token := GerarToken(usuario)
    
    json.NewEncoder(w).Encode(map[string]interface{}{
        "token":    token,
        "empresas": usuario.Empresas,
    })
}
```

### 3.2. Middleware de Validação (para rotas protegidas)

```go
func ValidarDispositivo(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Pega o Device ID do header
        deviceId := r.Header.Get("X-Device-ID")
        
        if deviceId == "" {
            // Se não tem Device ID, permite (compatibilidade com web)
            next.ServeHTTP(w, r)
            return
        }

        // Valida se o dispositivo está ativo
        dispositivo, err := BuscarDispositivoPorId(deviceId)
        if err != nil || dispositivo.Status == "B" {
            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusForbidden)
            json.NewEncoder(w).Encode(map[string]interface{}{
                "erro":            "Dispositivo bloqueado",
                "deviceBlocked":   true,
                "motivoBloqueio":  dispositivo.MotivoBloqueio,
                "dataBloqueio":    dispositivo.DataBloqueio,
            })
            return
        }

        next.ServeHTTP(w, r)
    })
}
```

### 3.3. Funções Auxiliares

```go
// Buscar dispositivo por ID
func BuscarDispositivoPorId(deviceId string) (*Dispositivo, error) {
    var dispositivo Dispositivo
    query := `
        SELECT ID, DEVICE_ID, ID_USU, DEVICE_NAME, MODEL_NAME, OS_NAME, 
               OS_VERSION, PLATFORM, APP_VERSION, STATUS, DATA_PRIMEIRO_LOGIN,
               DATA_ULTIMO_LOGIN, MOTIVO_BLOQUEIO, DATA_BLOQUEIO
        FROM DISPOSITIVOS_AUTORIZADOS
        WHERE DEVICE_ID = ?
    `
    err := db.QueryRow(query, deviceId).Scan(
        &dispositivo.ID,
        &dispositivo.DeviceId,
        &dispositivo.IdUsu,
        &dispositivo.DeviceName,
        &dispositivo.ModelName,
        &dispositivo.OsName,
        &dispositivo.OsVersion,
        &dispositivo.Platform,
        &dispositivo.AppVersion,
        &dispositivo.Status,
        &dispositivo.DataPrimeiroLogin,
        &dispositivo.DataUltimoLogin,
        &dispositivo.MotivoBloqueio,
        &dispositivo.DataBloqueio,
    )
    return &dispositivo, err
}

// Registrar novo dispositivo (primeiro acesso)
func RegistrarDispositivo(deviceId string, idUsu int, deviceInfo DeviceInfo) error {
    query := `
        INSERT INTO DISPOSITIVOS_AUTORIZADOS 
        (DEVICE_ID, ID_USU, DEVICE_NAME, MODEL_NAME, OS_NAME, OS_VERSION, 
         PLATFORM, APP_VERSION, STATUS, DATA_PRIMEIRO_LOGIN, DATA_ULTIMO_LOGIN)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'A', NOW(), NOW())
    `
    _, err := db.Exec(query, 
        deviceId, 
        idUsu, 
        deviceInfo.DeviceName,
        deviceInfo.ModelName,
        deviceInfo.OsName,
        deviceInfo.OsVersion,
        deviceInfo.Platform,
        deviceInfo.AppVersion,
    )
    return err
}

// Atualizar último login
func AtualizarUltimoLogin(deviceId string, deviceInfo DeviceInfo) error {
    query := `
        UPDATE DISPOSITIVOS_AUTORIZADOS
        SET DATA_ULTIMO_LOGIN = NOW(),
            DEVICE_NAME = ?,
            MODEL_NAME = ?,
            OS_VERSION = ?,
            APP_VERSION = ?
        WHERE DEVICE_ID = ?
    `
    _, err := db.Exec(query,
        deviceInfo.DeviceName,
        deviceInfo.ModelName,
        deviceInfo.OsVersion,
        deviceInfo.AppVersion,
        deviceId,
    )
    return err
}
```

---

## 🖥️ 4. ROTAS PARA O PAINEL ADMINISTRATIVO

### 4.1. Listar Dispositivos (GET /admin/dispositivos)

```go
func ListarDispositivos(w http.ResponseWriter, r *http.Request) {
    // Parâmetros de filtro
    status := r.URL.Query().Get("status")      // A, B, ou vazio (todos)
    idUsu := r.URL.Query().Get("id_usu")       // Filtrar por usuário
    platform := r.URL.Query().Get("platform")  // ios, android
    
    query := `
        SELECT d.ID, d.DEVICE_ID, d.ID_USU, u.NOME as USUARIO_NOME,
               d.DEVICE_NAME, d.MODEL_NAME, d.OS_NAME, d.OS_VERSION,
               d.PLATFORM, d.APP_VERSION, d.STATUS, d.DATA_PRIMEIRO_LOGIN,
               d.DATA_ULTIMO_LOGIN, d.MOTIVO_BLOQUEIO, d.DATA_BLOQUEIO,
               ub.NOME as BLOQUEADO_POR_NOME
        FROM DISPOSITIVOS_AUTORIZADOS d
        LEFT JOIN USUARIOS u ON d.ID_USU = u.ID
        LEFT JOIN USUARIOS ub ON d.BLOQUEADO_POR = ub.ID
        WHERE 1=1
    `
    
    args := []interface{}{}
    
    if status != "" {
        query += " AND d.STATUS = ?"
        args = append(args, status)
    }
    
    if idUsu != "" {
        query += " AND d.ID_USU = ?"
        args = append(args, idUsu)
    }
    
    if platform != "" {
        query += " AND d.PLATFORM = ?"
        args = append(args, platform)
    }
    
    query += " ORDER BY d.DATA_ULTIMO_LOGIN DESC"
    
    rows, err := db.Query(query, args...)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    defer rows.Close()
    
    dispositivos := []Dispositivo{}
    for rows.Next() {
        var d Dispositivo
        rows.Scan(
            &d.ID, &d.DeviceId, &d.IdUsu, &d.UsuarioNome,
            &d.DeviceName, &d.ModelName, &d.OsName, &d.OsVersion,
            &d.Platform, &d.AppVersion, &d.Status, &d.DataPrimeiroLogin,
            &d.DataUltimoLogin, &d.MotivoBloqueio, &d.DataBloqueio,
            &d.BloqueadoPorNome,
        )
        dispositivos = append(dispositivos, d)
    }
    
    json.NewEncoder(w).Encode(dispositivos)
}
```

### 4.2. Bloquear Dispositivo (PUT /admin/dispositivos/:id/bloquear)

```go
func BloquearDispositivo(w http.ResponseWriter, r *http.Request) {
    var payload struct {
        Motivo string `json:"motivo"`
    }
    
    json.NewDecoder(r.Body).Decode(&payload)
    
    // Pega ID do dispositivo da URL
    vars := mux.Vars(r)
    dispositivoId := vars["id"]
    
    // Pega ID do usuário admin que está bloqueando (do token)
    adminId := GetUserIdFromToken(r)
    
    query := `
        UPDATE DISPOSITIVOS_AUTORIZADOS
        SET STATUS = 'B',
            DATA_BLOQUEIO = NOW(),
            MOTIVO_BLOQUEIO = ?,
            BLOQUEADO_POR = ?
        WHERE ID = ?
    `
    
    _, err := db.Exec(query, payload.Motivo, adminId, dispositivoId)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Dispositivo bloqueado com sucesso",
    })
}
```

### 4.3. Desbloquear Dispositivo (PUT /admin/dispositivos/:id/desbloquear)

```go
func DesbloquearDispositivo(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    dispositivoId := vars["id"]
    
    query := `
        UPDATE DISPOSITIVOS_AUTORIZADOS
        SET STATUS = 'A',
            DATA_BLOQUEIO = NULL,
            MOTIVO_BLOQUEIO = NULL,
            BLOQUEADO_POR = NULL
        WHERE ID = ?
    `
    
    _, err := db.Exec(query, dispositivoId)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    json.NewEncoder(w).Encode(map[string]string{
        "message": "Dispositivo desbloqueado com sucesso",
    })
}
```

---

## 🎨 5. INTERFACE DO PAINEL (FRONTEND WEB)

### 5.1. Tela de Listagem

```tsx
// Exemplo de como deve ser a tela no painel web
<Table>
  <thead>
    <tr>
      <th>Dispositivo</th>
      <th>Usuário</th>
      <th>Plataforma</th>
      <th>Último Login</th>
      <th>Status</th>
      <th>Ações</th>
    </tr>
  </thead>
  <tbody>
    {dispositivos.map(d => (
      <tr key={d.id}>
        <td>
          <div>{d.deviceName || 'Sem nome'}</div>
          <small>{d.modelName}</small>
        </td>
        <td>{d.usuarioNome}</td>
        <td>
          {d.platform === 'ios' ? '🍎 iOS' : '🤖 Android'} {d.osVersion}
        </td>
        <td>{formatDate(d.dataUltimoLogin)}</td>
        <td>
          {d.status === 'A' ? (
            <Badge color="green">Ativo</Badge>
          ) : (
            <Badge color="red">Bloqueado</Badge>
          )}
        </td>
        <td>
          {d.status === 'A' ? (
            <Button onClick={() => bloquear(d.id)}>Bloquear</Button>
          ) : (
            <Button onClick={() => desbloquear(d.id)}>Desbloquear</Button>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</Table>
```

---

## 📊 6. ESTATÍSTICAS ÚTEIS

```sql
-- Total de dispositivos ativos/bloqueados
SELECT 
  STATUS,
  COUNT(*) as TOTAL,
  COUNT(DISTINCT ID_USU) as USUARIOS_UNICOS
FROM DISPOSITIVOS_AUTORIZADOS
GROUP BY STATUS;

-- Dispositivos por plataforma
SELECT 
  PLATFORM,
  COUNT(*) as TOTAL
FROM DISPOSITIVOS_AUTORIZADOS
WHERE STATUS = 'A'
GROUP BY PLATFORM;

-- Dispositivos sem login há mais de 30 dias
SELECT *
FROM DISPOSITIVOS_AUTORIZADOS
WHERE DATA_ULTIMO_LOGIN < DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY DATA_ULTIMO_LOGIN DESC;
```

---

## 🚀 7. FLUXO COMPLETO

1. **Usuário faz login no mobile**
   - Mobile envia `deviceId` + `deviceInfo`

2. **Backend recebe o login**
   - Valida email/senha
   - Verifica se `deviceId` existe na tabela
   - Se não existe: registra automaticamente como ATIVO
   - Se existe e está BLOQUEADO: retorna erro 403
   - Se existe e está ATIVO: atualiza último login

3. **Em todas as requisições seguintes**
   - Mobile envia `X-Device-ID` no header
   - Middleware valida se dispositivo ainda está ativo
   - Se bloqueado: retorna erro 403

4. **Admin bloqueia dispositivo no painel**
   - Frontend chama PUT /admin/dispositivos/:id/bloquear
   - Backend atualiza STATUS = 'B'

5. **Mobile tenta fazer requisição**
   - Middleware detecta dispositivo bloqueado
   - Retorna erro 403 com `deviceBlocked: true`
   - Mobile exibe mensagem e faz logout

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend (Go):
- [ ] Criar tabela `DISPOSITIVOS_AUTORIZADOS`
- [ ] Modificar endpoint de login para receber `deviceId` e `deviceInfo`
- [ ] Adicionar validação de dispositivo no login
- [ ] Criar middleware de validação para rotas protegidas
- [ ] Criar rota GET `/admin/dispositivos` (listar)
- [ ] Criar rota PUT `/admin/dispositivos/:id/bloquear`
- [ ] Criar rota PUT `/admin/dispositivos/:id/desbloquear`

### Frontend (Painel Web):
- [ ] Criar tela de listagem de dispositivos
- [ ] Adicionar filtros (status, usuário, plataforma)
- [ ] Implementar ação de bloquear
- [ ] Implementar ação de desbloquear
- [ ] Adicionar modal de confirmação com campo "motivo"

### Mobile (React Native):
- [x] Instalar bibliotecas `expo-application` e `expo-device`
- [x] Criar utility `getDeviceId()`
- [x] Modificar login para enviar `deviceId` e `deviceInfo`
- [x] Adicionar `X-Device-ID` no header de todas as requisições
- [ ] Tratar erro 403 com `deviceBlocked: true` (exibir mensagem e fazer logout)

---

## 🔒 SEGURANÇA

1. **Device ID é único mas não secreto** - Não use como autenticação, apenas como identificador
2. **Sempre validar token JWT** junto com Device ID
3. **Log de bloqueios** - Manter histórico de quem bloqueou e quando
4. **Permissões** - Apenas admins podem bloquear/desbloquear dispositivos
5. **Notificações** - Opcional: notificar usuário por email quando dispositivo for bloqueado

---

## 📝 EXEMPLO DE RESPOSTA DE LOGIN BLOQUEADO

```json
{
  "erro": "Dispositivo bloqueado",
  "deviceBlocked": true,
  "motivoBloqueio": "Dispositivo não autorizado pela empresa",
  "dataBloqueio": "2025-12-18T15:30:00Z"
}
```

O mobile deve detectar `deviceBlocked: true` e exibir uma mensagem específica ao usuário.

---

## 🆘 SUPORTE

Se tiver dúvidas na implementação, consulte:
- `D:\NodeProjects\touch-go-mobile\src\utils\deviceId.ts` - Implementação mobile
- `D:\NodeProjects\touch-go-mobile\src\contexts\AuthContext.tsx` - Envio do deviceId no login
- `D:\NodeProjects\touch-go-mobile\src\services\api.ts` - Interceptor que adiciona X-Device-ID



