defmodule Stt.State do


  @file_path Path.absname(Path.join([".","config","state.json"]))
  @doc """
  Fonction qui enregistre le dernier état 
  """
  def save(data) do
    data = Map.merge(whole_data(), data)
    File.write!(@file_path, Jason.encode!(data))
  end
  
  @doc """
  @return {String} La dernière structure, soit chargée soit sauvée
  """
  def get_last_structure do
    state = whole_data()
    case state["last_op"] do
    "save" -> state["last_saved"]
    "load" -> state["last_loaded"]
    _ -> "default"
    end
  end

  @doc """
  @return {Map} La table des propriétés ou de la propriété state à
  obtenir.
  """
  def get(key) when is_binary(key) do
    whole_data()[key]
  end
  def get(key)  when is_atom(key), do: get(Atom.to_string(key))
  def get(mapped_keys) when is_map(mapped_keys) do
    Map.intersect(whole_data(), mapped_keys)
  end

  defp whole_data do
    if File.exists?(@file_path) do
      File.read!(@file_path) |> Jason.decode!()
    else %{} end
  end

end