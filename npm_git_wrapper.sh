git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://".insteadOf git://
npm install
git config --global --unset url."https://github.com/".insteadOf git@github.com:
git config --global --unset url."https://".insteadOf git://