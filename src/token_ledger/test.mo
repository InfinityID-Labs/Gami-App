import Prim "mo:prim";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";

persistent actor class TestTokenLedger() = this {
  public func testAll() : async Text {
    Debug.print("[TEST] Ledger mock test");
    "Testes do TokenLedger executados (mock). Implemente com motoko-shunit para testes reais.";
  };
};
