### **SkinLoot**  
Uma plataforma para compra, venda e troca de skins de jogos entre usuários.  

---

## 📌 **Sobre o projeto**  
A **SkinLoot** é uma plataforma inovadora que conecta jogadores interessados em comprar, vender e trocar skins de seus jogos favoritos. O objetivo é proporcionar uma experiência segura, intuitiva e eficiente para a negociação de itens virtuais.

---

## 🚀 **Principais funcionalidades**  
✅ **Marketplace de Skins** – Usuários podem listar e comprar skins de diversos jogos.  
✅ **Sistema de Trocas** – Troque skins diretamente com outros usuários.  
✅ **Segurança nas Transações** – Proteção contra fraudes e verificação de itens.  
✅ **Gestão de Inventário** – Acompanhe todas as suas skins e negociações em um só lugar.  
✅ **Recomendações Inteligentes** – Sugestões de skins com base nas preferências do usuário.  

---

## 🛠 **Tecnologias Utilizadas**  
- **Back-end:** Java (Spring Boot)  
- **Front-end:** Angular  
- **Banco de Dados:** PostgreSQL  
- **Autenticação:** JWT (JSON Web Token)  
- **Integração com APIs de Jogos**  

---

## 🎮 **Como Rodar o Projeto**  

### **Pré-requisitos**  
Antes de começar, certifique-se de ter instalado:  
- **Java 17+**  
- **Node.js 18+**  
- **PostgreSQL**  
- **Docker (opcional)**  

### **1️⃣ Clone o repositório**
```sh
git clone https://github.com/SkinLoot/SkinLoot.git
cd SkinLoot
```

### **2️⃣ Configure o Banco de Dados**  
Crie um banco no PostgreSQL e configure as credenciais no `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/skinloot
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### **3️⃣ Execute o Back-end**  
```sh
cd backend
mvn spring-boot:run
```

### **4️⃣ Execute o Front-end**  
```sh
cd frontend
npm install
ng serve
```

---

## 📄 **Licença**  
Este projeto é de código aberto e está licenciado sob a **MIT License**. 
