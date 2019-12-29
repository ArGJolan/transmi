USERNAME=${USERNAME:-$USER}
read -p "Choose a username [$USERNAME]: " TRANSMI_USERNAME
export TRANSMI_USERNAME=${TRANSMI_USERNAME:-$USERNAME}

read -s -p "Choose a password to access Transmi with $TRANSMI_USERNAME [toto4242]: " TRANSMI_PASSWORD
TRANSMI_PASSWORD=${TRANSMI_PASSWORD:-toto4242}

echo "USING PASSWORD $TRANSMI_PASSWORD"

command -v sha1sum && export TRANSMI_PASSWORD=`echo -n $TRANSMI_PASSWORD | sha1sum 2> /dev/null | sed 's/  -//'`
command -v shasum && export TRANSMI_PASSWORD=`echo -n $TRANSMI_PASSWORD | shasum 2> /dev/null | sed 's/  -//'`

echo "USING PASSWORD $TRANSMI_PASSWORD"

node ./src/script/add-user.js
