defmodule SttWeb.StructureController do
  use SttWeb, :controller

  alias Stt.State
  
  @folder Path.absname(Path.join([".", "structures"]))
  # IO.puts "@folder = #{inspect @folder}"

  def load(conn, params) do
    full_path = Path.absname(Path.join([@folder, "#{params["structure_path"]}.stt.json"]))
    # On mémorise la dernière structure chargée
    Stt.State.save(%{last_loaded: params["structure_path"], last_op: :load})
    structure = Jason.decode!(File.read!(full_path))
    retour = %{
      ok: true,
      error: nil,
      structure: structure,
      disposition: State.get(:last_disposition)
    }
    conn |> json(retour) |> halt()
  end

  def save(conn, params) do
    retour = %{ok: true, error: nil}
    path = params["structure"]["metadata"]["path"]
    Stt.State.save(%{last_saved: params["structure_path"], last_op: :save})
    full_path = Path.join([@folder, "#{path}.stt.json"])
    File.write!(full_path, Jason.encode!(params["structure"]))

    conn
    |> json(retour)
    |> halt()
  end
end