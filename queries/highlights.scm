; ==============================================================================
; COMMENTS
; ==============================================================================

(comment) @comment

; ==============================================================================
; KEYWORDS
; ==============================================================================

[
  "extern"
  "fn"
  "let"
  "mut"
  "const"
  "type"
  "enum"
  "union"
  "struct"
  "interface"
  "namespace"
  "impl"
  "pass"
  "packed"
  "where"
  "requires"
  "extends"
] @keyword

; ==============================================================================
; BUILT-IN VALUES
; ==============================================================================

"self" @variable.builtin
(builtin_namespace) @namespace.builtin

; ==============================================================================
; TYPES
; ==============================================================================

; Built-in types
[
  (type_u8)
  (type_u16)
  (type_u32)
  (type_u64)
  (type_i8)
  (type_i16)
  (type_i32)
  (type_i64)
  (type_f32)
  (type_f64)
  (type_bool)
] @type.builtin

; Path segments in type contexts
(path
  (path_segment
    (identifier) @type
    (generic_arguments)? @type.argument
  )
)

; Standalone path segments
(path_segment
  (identifier) @type
)

; Generic arguments
(generic_arguments) @punctuation.bracket
(generic_arguments
  (type_annotation)
)

; ==============================================================================
; FUNCTIONS
; ==============================================================================

(function_signature
  (path
    (path_segment
      (identifier) @function
    )
  )
)

(postfix_expression
  (primary_expression)
  "::"
  (identifier) @function
)

; ==============================================================================
; VARIABLES AND PARAMETERS
; ==============================================================================

(identifier) @variable

(parameter
  (identifier) @variable.parameter
)

(const_statement
  (identifier) @constant
)

(generic_parameters
  (identifier) @type.definition
)

(type_constraint
  (identifier) @type.definition
)

; ==============================================================================
; ENUM, UNION, AND STRUCT MEMBERS
; ==============================================================================

(enum_variant
  (identifier) @constant
)

(union_variant
  (identifier) @variable.member
)

(struct_field
  (identifier) @variable.member
)

; ==============================================================================
; NAMESPACES AND MODULES
; ==============================================================================

(namespace_definition
  (path
    (path_segment
      (identifier) @module
    )
  )
)

(path_segment
  (builtin_namespace) @namespace.builtin
)

; ==============================================================================
; OPERATORS
; ==============================================================================

[
  "="
  "::"
  "."
  "->"
  "?"
  "+"
  "-"
  "*"
  "/"
  "%"
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
  "&&"
  "||"
  "!"
  "&"
  "|"
  "^"
  "~"
  "<<"
  ">>"
] @operator

; ==============================================================================
; PUNCTUATION
; ==============================================================================

[
  ":"
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

; ==============================================================================
; LITERALS
; ==============================================================================

(number) @number
(boolean) @boolean
(string) @string
(interpolated_string) @string
