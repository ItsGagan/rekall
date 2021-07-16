# frozen_string_literal: true

class Api::V1::ResultsController < Api::V1::BaseController
  before_action :load_query_group
  before_action :load_query
  before_action :load_query_result, only: [:show, :update, :destroy, :register_score]
  before_action :validate_score_params, only: [:register_score]

  def index
    render json: { result: @query.last_result, notice: "Fetched the latest query results!" }
  end

  def fetch_fresh_results
    @result = @query.fetch_fresh_results!
    if @result && !@result.errors.present?
      render json: { result: @result, notice: "Fetched the latest query results!" }
    else
      render json: { error: "Some error occurred." }, status: 422
    end
  end

  def show
    render json: { result: @result }
  end

  def update
    if @result.update(result_params)
      render json: { result: @result, notice: "Query result has been updated!" }
    else
      render json: { error: @result.errors.full_messages.to_sentence }, status: 422
    end
  end

  def register_score
    @score = @result.register_score!(params[:value], params[:document_uuid])
    if !@score.errors.presence
      render json: { score: @score, notice: "Score for #{params[:document_uuid]} has been updated!" }
    else
      render json: { error: @score.errors.full_messages.to_sentence }, status: 422
    end
  end

  def destroy
    if @result.soft_delete
      render json: { result: @result, notice: "Query result has been deleted!" }
    else
      render json: { error: @result.errors.full_messages.to_sentence }, status: 422
    end
  end

  private

    def result_params
      params.require(:result).permit(:notes).to_h
    end

    def validate_score_params
      if !@query_group.scorer.is_valid_scale_value?(params[:value])
        render json: { error: "Score value should be in #{@query_group.scorer.scale.inspect}", notice: "Score value should be in #{@query_group.scorer.scale.inspect}" }, status: 422
        return
      end

      if !@result.has_document?(params[:document_uuid])
        render json: { error: "document_uuid should be in results", notice: " document_uuid should be in results" }, status: 422
      end
    end

    def load_query_group
      @query_group = QueryGroup.active.find(params[:query_group_id])
    end

    def load_query
      @query = @query_group.queries.active.find(params[:query_id])
    end

    def load_query_result
      @result = @query.results.active.find(params[:id])
    end
end
