
        const isValidPassword = await bcrypt.compare(password, storedPassword);