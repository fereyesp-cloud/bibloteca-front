#!/usr/bin/env bash
set -Eeuo pipefail

# Se ejecuta DENTRO de la EC2 (lo envía deploy-to-instance.sh por Systems Manager).
# Reemplaza el contenedor del frontend, con rollback automático si algo falla.

image="${1:?image URI is required}"
region="${2:?AWS region is required}"
if [[ ! "$image" =~ ^[0-9]{12}\.dkr\.ecr\.[a-z0-9-]+\.amazonaws\.com/biblioteca-front:[0-9a-f]{40}$ ]]; then
  echo "Invalid frontend ECR image URI." >&2
  exit 2
fi
if [[ ! "$region" =~ ^[a-z0-9-]+$ ]]; then
  echo "Invalid AWS region." >&2
  exit 2
fi

registry="${image%%/*}"
docker_config="$(mktemp -d /tmp/biblioteca-ecr-docker.XXXXXX)"
export DOCKER_CONFIG="$docker_config"
cleanup_auth() {
  if [[ -n "$docker_config" ]]; then
    rm -rf -- "$docker_config"
    docker_config=""
  fi
}
trap cleanup_auth EXIT

aws ecr get-login-password --region "$region" \
  | docker login --username AWS --password-stdin "$registry" >/dev/null
docker pull "$image"
docker logout "$registry" >/dev/null 2>&1 || true
rm -f -- "$docker_config/config.json"

backup=""
new_container_attempted=false
rollback() {
  status=$?
  trap - EXIT
  if (( status != 0 )); then
    if [[ "$new_container_attempted" == true ]] && docker inspect biblioteca-frontend >/dev/null 2>&1; then
      docker rm -f biblioteca-frontend >/dev/null
    fi
    if [[ -n "$backup" ]] && docker inspect "$backup" >/dev/null 2>&1; then
      docker rename "$backup" biblioteca-frontend
      docker start biblioteca-frontend
      echo "Frontend deployment failed; previous container restored." >&2
    fi
  fi
  cleanup_auth
  exit "$status"
}
trap rollback EXIT

if docker inspect biblioteca-frontend >/dev/null 2>&1; then
  backup="biblioteca-frontend-rollback-$(date +%s%N)"
  docker rename biblioteca-frontend "$backup"
  docker stop "$backup" >/dev/null || true
fi

# El contenedor es Nginx sirviendo Angular en su puerto 80.
# En la EC2 se publica en el 4000, que es donde el Nginx del host envía "/".
new_container_attempted=true
docker run -d \
  --name biblioteca-frontend \
  --restart unless-stopped \
  --publish 127.0.0.1:4000:80 \
  "$image" >/dev/null

healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:4000/ >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done
if [[ "$healthy" != true ]]; then
  echo "Frontend health check failed on port 4000." >&2
  docker logs --tail 50 biblioteca-frontend >&2 || true
  exit 1
fi

if [[ -n "$backup" ]]; then
  docker rm "$backup" >/dev/null
fi
backup=""
cleanup_auth
trap - EXIT
echo "Frontend deployed successfully: $image"
