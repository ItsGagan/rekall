web: RUBYOPT='-W:no-deprecated -W:no-experimental' bundle exec puma -C config/puma.rb
worker: RUBYOPT='-W:no-deprecated -W:no-experimental' bundle exec sidekiq -q default
release: RUBYOPT='-W:no-deprecated -W:no-experimental' bundle exec rake db:migrate && bundle exec rake reset_and_populate_sample_data