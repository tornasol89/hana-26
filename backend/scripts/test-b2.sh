#!/usr/bin/env bash
# Prueba manual del fix #B2 — PUT /api/bookings/:id/completar
# Requiere: backend corriendo local + jq instalado (brew install jq)
#
# Crea dos usuarias de prueba desechables vía /api/auth/register (no necesita
# credenciales reales) y valida que solo la dueña de la reserva pueda completarla.

set -e

API="http://localhost:5001/api"   # ajusta el puerto si tu backend corre en otro

# ── Genera un RUT chileno válido (dígito verificador módulo 11) ─────────────
gen_rut() {
  local base=$1
  node -e "
    const base = '$base';
    let suma = 0, mult = 2;
    for (let i = base.length - 1; i >= 0; i--) {
      suma += parseInt(base[i], 10) * mult;
      mult = mult === 7 ? 2 : mult + 1;
    }
    const resto = 11 - (suma % 11);
    const dv = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
    console.log(base + '-' + dv);
  "
}

TS=$(date +%s)
RUT_CLIENTA=$(gen_rut $((10000000 + RANDOM % 8999999)))
RUT_AJENA=$(gen_rut $((10000000 + RANDOM % 8999999)))
EMAIL_CLIENTA="test.b2.clienta.$TS@hana-test.cl"
EMAIL_AJENA="test.b2.ajena.$TS@hana-test.cl"

registrar() {
  local nombre=$1 email=$2 rut=$3
  curl -s -X POST "$API/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"nombre\":\"$nombre\",\"apellido\":\"TestB2\",\"email\":\"$email\",\"password\":\"Test1234!\",\"tipo\":\"clienta\",\"region\":\"Metropolitana\",\"comuna\":\"Maipu\",\"rut\":\"$rut\",\"fechaNacimiento\":\"1995-01-01\",\"aceptoCompromiso\":true}"
}

echo "── 1. Registrar clienta de prueba (dueña de la reserva) ──"
RESP_CLIENTA=$(registrar "TestClienta" "$EMAIL_CLIENTA" "$RUT_CLIENTA")
TOKEN_CLIENTA=$(echo "$RESP_CLIENTA" | jq -r '.token')
if [ "$TOKEN_CLIENTA" = "null" ] || [ -z "$TOKEN_CLIENTA" ]; then
  echo "❌ Falló el registro de la clienta. Respuesta completa:"
  echo "$RESP_CLIENTA" | jq
  exit 1
fi
echo "Token clienta OK: ${TOKEN_CLIENTA:0:20}..."

echo "── 2. Registrar usuaria ajena de prueba ──"
RESP_AJENA=$(registrar "TestAjena" "$EMAIL_AJENA" "$RUT_AJENA")
TOKEN_AJENA=$(echo "$RESP_AJENA" | jq -r '.token')
if [ "$TOKEN_AJENA" = "null" ] || [ -z "$TOKEN_AJENA" ]; then
  echo "❌ Falló el registro de la ajena. Respuesta completa:"
  echo "$RESP_AJENA" | jq
  exit 1
fi
echo "Token ajena OK: ${TOKEN_AJENA:0:20}..."

echo "── 3. Obtener un ID de trabajadora real (endpoint público) ──"
TRABAJADORA_ID=$(curl -s "$API/workers" | jq -r '.[0]._id')
if [ "$TRABAJADORA_ID" = "null" ] || [ -z "$TRABAJADORA_ID" ]; then
  echo "❌ No hay trabajadoras registradas en /api/workers. Crea al menos una para poder probar."
  exit 1
fi
echo "Trabajadora ID: $TRABAJADORA_ID"

echo "── 4. Crear una reserva como la clienta ──"
RESP_BOOKING=$(curl -s -X POST "$API/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN_CLIENTA" \
  -d "{\"trabajadora\":\"$TRABAJADORA_ID\",\"regionServicio\":\"Metropolitana\",\"comunaServicio\":\"Maipu\",\"servicio\":\"Test B2\"}")
RESERVA_ID=$(echo "$RESP_BOOKING" | jq -r '._id')
if [ "$RESERVA_ID" = "null" ] || [ -z "$RESERVA_ID" ]; then
  echo "❌ Falló la creación de la reserva. Respuesta completa:"
  echo "$RESP_BOOKING" | jq
  exit 1
fi
echo "Reserva creada: $RESERVA_ID"

echo ""
echo "── 5. CASO MALICIOSO: usuaria ajena intenta completar (debe dar 403) ──"
curl -s -o /tmp/resp_ajena.json -w "Status: %{http_code}\n" -X PUT \
  "$API/bookings/$RESERVA_ID/completar" \
  -H "Authorization: Bearer $TOKEN_AJENA"
cat /tmp/resp_ajena.json; echo ""

echo ""
echo "── 6. CASO LEGÍTIMO: la clienta dueña completa su propia reserva (debe dar 200) ──"
curl -s -o /tmp/resp_clienta.json -w "Status: %{http_code}\n" -X PUT \
  "$API/bookings/$RESERVA_ID/completar" \
  -H "Authorization: Bearer $TOKEN_CLIENTA"
cat /tmp/resp_clienta.json; echo ""