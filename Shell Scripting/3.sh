echo "Choose a option"
echo "a=Send current date and time"
echo "b=List all files in dir"

read choice

case $choice in 
    a)date;;
    b)ls;;
    *)echo "Not a valid choice"
esac
