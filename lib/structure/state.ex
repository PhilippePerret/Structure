defmodule Stt.State do


  @file_path Path.absname(Path.join([".","config","state.json"]))
  @doc """
  Fonction qui enregistre le dernier état 
  """
  def save(data) do
    data = Map.merge(whole_data(), data)
    File.write!(@file_path, Jason.encode!(data))
  end
  
  def get(key) when is_atom(key) do
    retour = %{ok: true, state: whole_data()[key]}
  end
  
  def get(mapped_keys) when is_map(mapped_keys) do
    mapped_keys = Map.intersect(whole_data(), mapped_keys)
  end

  defp whole_data do
    if File.exists?(@file_path) do
      File.read!(@file_path) |> Jason.decode!(keys: :atoms)
    else %{} end
  end

end