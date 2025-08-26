import Result "mo:base/Result";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

// Tipos HTTP básicos
module {
  public type HttpRequest = {
    method : Text;
    url : Text;
    headers : [(Text, Text)];
    body : Blob;
    certificate_version : ?Nat16;
  };
  public type HttpResponse = {
    status : Nat16;
    headers : [(Text, Text)];
    body : Blob;
    streaming_strategy : ?();
  };
};
