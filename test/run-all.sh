GREEN="\x1b[32m"
RED="\x1b[31m"
RESET="\x1b[37m"

TEST=$(pwd)/test/

echo "RUNNING TESTS IN" $GREEN$TEST$RESET
echo "..."

run_test() {
  SCRIPT=$1
  node $TEST$SCRIPT
}

run_test "renderer.js"
run_test "modules/platform.js"
