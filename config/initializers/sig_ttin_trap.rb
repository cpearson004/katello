# This initalizer overrides the TTIN signal:
#   http://www.gnu.org/software/coreutils/manual/html_node/Signal-specifications.html
#   TTIN - Background process attempting read.
# This signal is not used with the thin server so we can override and add our additional
# behavior.  if/when we switch to Passenger we can use their existing ABRT (SIGABRT) trap
# which prints a threaddump and backtrace

trap('TTIN') do
  puts "Starting thread dump for current Ruby process"
  puts "============================================="
  puts ""
  Thread.list.each do |thread|
    puts "Thread TID-#{thread.object_id.to_s}"
    puts thread.backtrace
    puts ""
  end
end

