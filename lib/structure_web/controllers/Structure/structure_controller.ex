defmodule SttWeb.StructureController do
  use SttWeb, :controller

  @folder Path.absname(Path.join([".", "structures"]))
  IO.puts "@folder = #{inspect @folder}"

  def load(conn, params) do
    full_path = Path.absname(Path.join([@folder, "#{params["structure_path"]}.stt.json"]))
    structure = Jason.decode!(File.read!(full_path))
    retour = %{
      ok: true,
      error: nil,
      structure: structure
    }
    conn |> json(retour) |> halt()
  end

  def save(conn, params) do
    retour = %{ok: true, error: nil}
    path = params["structure"]["metadata"]["path"]
    full_path = Path.join([@folder, "#{path}.stt.json"])
    File.write!(full_path, Jason.encode!(params["structure"]))

    conn
    |> json(retour)
    |> halt()
  end
end