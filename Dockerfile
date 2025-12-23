FROM registry.access.redhat.com/ubi9/nginx-120

# Copy static content
COPY index.html /usr/share/nginx/html/index.html

# Files are readable by any UID
RUN chgrp -R 0 /usr/share/nginx/html \
 && chmod -R g=u /usr/share/nginx/html

EXPOSE 8080

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
