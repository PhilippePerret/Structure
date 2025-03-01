defmodule SttWeb.Layouts do
  @moduledoc """
  This module holds different layouts used by your application.

  See the `layouts` directory for all templates available.
  The "root" layout is a skeleton rendered as part of the
  application router. The "app" layout is set as the default
  layout on both `use SttWeb, :controller` and
  `use SttWeb, :live_view`.
  """
  use SttWeb, :html

  embed_templates "layouts/*"

  def footer(assigns)

  # Pour les trois formes d'affichage de la structure
  def stt_editing(assigns)
  def stt_vertical(assigns)
  def stt_horizontal(assigns)
  
  def form_element(assigns)

  attr :id, :string, required: true
  attr :class, :string, required: true
  def select_type(assigns) do
    ~H"""
    <select id={@id} class={@class}>
      <option value="scene">Scène</option>
      <option value="seq">Séquence</option>
    </select>
    """
  end
  
  attr :id, :string, required: true
  attr :class, :string, required: true
  def select_ideality(assigns) do
    ~H"""
    <select id={@id} class={@class}>
      <option value="none">concrète</option>
      <option value="pfa">dans le PFA</option>
      <option value="project">dans les plans</option>
    </select>
    """
  end

end
