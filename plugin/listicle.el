(defun decode-entities (html)
  (with-temp-buffer
    (save-excursion (insert html))
    (xml-parse-string)))

(defun listicle ()
  "all click, no bait"
  (interactive)
  (with-current-buffer (url-retrieve-synchronously "http://listicl.es")
    (message
     (decode-entities
      (substring (buffer-string) (search-forward "listicle_content\">") (- (search-forward "</") 3)))
     (kill-buffer))))

(global-set-key (kbd "C-l") 'listicle)
