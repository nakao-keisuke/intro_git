package main

  import (
        "database/sql"
        "net/http"

        "github.com/labstack/echo/v4"
        _ "github.com/go-sql-driver/mysql"
  )

  var db *sql.DB

  type User struct {
        ID    int    `json:"id"`
        Name  string `json:"name"`
        Email string `json:"email"`
  }

  func main() {
        var err error
        db, err = sql.Open("mysql", "root@tcp(127.0.0.1:3306)/test")
        if err != nil {
                panic(err)
        }
        defer db.Close()

        e := echo.New()

        e.GET("/users", getUsers)
        e.GET("/users/:id", getUserByID)

        e.Logger.Fatal(e.Start(":8080"))
  }

  func getUsers(c echo.Context) error {
        rows, err := db.Query("SELECT id, name, email FROM users")
        if err != nil {
                return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
        }
        defer rows.Close()

        var users []User
        for rows.Next() {
                var u User
                if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
                        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
                }
                users = append(users, u)
        }

        return c.JSON(http.StatusOK, users)
  }

  func getUserByID(c echo.Context) error {
        id := c.Param("id")

        var u User
        err := db.QueryRow("SELECT id, name, email FROM users WHERE id = ?", id).
                Scan(&u.ID, &u.Name, &u.Email)
        if err == sql.ErrNoRows {
                return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
        }
        if err != nil {
                return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
        }

        return c.JSON(http.StatusOK, u)
  }
